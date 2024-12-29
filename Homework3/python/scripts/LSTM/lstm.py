import sqlite3
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import r2_score, mean_absolute_error, root_mean_squared_error
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
import numpy as np
import matplotlib.pyplot as plt  # For plotting

# Constants
DB_PATH = "stock_data.db"
EPOCHS = 64
FEATURES = ["last_trade_price"]
TARGET_COLUMN = "last_trade_price"  # Column to predict
LAG = 14
MIN_SAMPLES = 100
VALIDATION_SPLIT = 0.2  # Reduced to leave more data for training
RANDOM_STATE = 42  # For reproducibility
PRED_DAYS = 30  # Number of future days to predict

# Establish database connection
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS evaluation_metrics (
    issuer TEXT PRIMARY KEY,
    r2_score REAL,
    mean_absolute_error REAL,
    root_mean_squared_error REAL,
    last_trade_price REAL
)
""")
conn.commit()

cursor.execute("""
CREATE TABLE IF NOT EXISTS next_month_predictions (
    issuer TEXT,
    date TEXT,
    predicted_price REAL
)
""")
conn.commit()


def get_unique_issuers(conn):
    query = "SELECT DISTINCT issuer FROM stock_data"
    df = pd.read_sql(query, conn)
    return df['issuer'].tolist()


def load_issuer_data(conn, issuer):
    query = """
    SELECT *
    FROM stock_data
    WHERE issuer = ?
    ORDER BY date ASC
    """
    df = pd.read_sql(query, conn, params=(issuer,))
    return df


def create_sequences(data, lag, target_column):
    # Lagging
    X = []
    y = []
    for i in range(lag, len(data)):
        X.append(data.iloc[i - lag:i].values)
        y.append(data.iloc[i][target_column])
    return np.array(X), np.array(y)


def predict_next_month(model, scaled_df, scaler_features, scaler_target, lag, start_date, clip_value=0.005):
    last_sequence = scaled_df[-lag:].copy()  # shape -> (lag, num_features)

    last_real_price = scaler_target.inverse_transform(
        scaled_df[-1:][['last_trade_price']]
    )[0, 0]

    future_dates = []
    future_predictions = []

    current_input = scaled_df.copy()

    for day_offset in range(1, PRED_DAYS + 1):
        model_input = np.array([last_sequence.values])  # Shape (1, lag, features)

        # Predict and clip the scaled prediction
        pred_scaled = model.predict(model_input, verbose=0)  # shape -> (1, 1)
        pred_scaled = np.clip(
            pred_scaled,
            last_sequence.iloc[-1]['last_trade_price'] * (1 - clip_value),
            last_sequence.iloc[-1]['last_trade_price'] * (1 + clip_value)
        ).reshape(-1, 1)

        # Inverse transform to get actual price
        pred_price = scaler_target.inverse_transform(pred_scaled)[0, 0]

        pred_date = start_date + pd.Timedelta(days=day_offset)
        future_dates.append(pred_date)
        future_predictions.append(pred_price)

        # Update sequence with the new prediction (for the next input)
        last_sequence = last_sequence.iloc[1:].copy()  # Slide the window

        # Construct the new row for prediction
        new_features = {
            'last_trade_price': pred_price,
        }

        new_row_df = pd.DataFrame([new_features], index=[pred_date])

        # Scale the new row and append it to the input sequence
        new_row_scaled = scaler_features.transform(new_row_df)
        next_row = pd.DataFrame([new_row_scaled[0]],
                                columns=scaled_df.columns,
                                index=[pred_date])
        last_sequence = pd.concat([last_sequence, next_row])

        last_real_price = pred_price  # Update the real price tracker

    return future_dates, future_predictions


def plot_results(issuer, df, train_size, test_y_inv, pred_y_inv, prediction_df):
    plt.figure(figsize=(14, 7))

    # Plot historical data
    plt.plot(df.index, df['last_trade_price'], label='Historical Last Trade Price')

    # Plot test set actual vs predicted
    test_dates = df.index[train_size:]
    plt.plot(test_dates, test_y_inv, label='Actual Last Trade Price (Test Set)', color='green')
    plt.plot(test_dates, pred_y_inv, label='Predicted Last Trade Price (Test Set)', color='red', linestyle='--')

    # Plot one-month ahead predictions
    plt.plot(prediction_df.index, prediction_df['predicted_price'], label='Predicted Last Trade Price (1 Month Ahead)',
             color='orange', linestyle='--')

    plt.xlabel('Date')
    plt.ylabel('Last Trade Price')
    plt.title(f'Stock Price Prediction for {issuer}')
    plt.legend()
    plt.grid(True)

    # Improve date formatting on the x-axis
    plt.gcf().autofmt_xdate()
    plt.show()


# Retrieve all unique issuers
issuers = get_unique_issuers(conn)

for issuer in issuers:
    best_model = None
    best_r2_score = None
    best_mean_absolute_error = None
    best_root_mean_squared_error = None

    print(f"Processing issuer: {issuer}")
    # Load data for the current issuer
    df = load_issuer_data(conn, issuer)

    # Check if the issuer has enough data
    if len(df) < MIN_SAMPLES:
        print(f"Skipping issuer {issuer} due to insufficient data "
              f"({len(df)} samples). Minimum required is {MIN_SAMPLES}.\n")
        continue  # Skip to the next issuer

    # Data Cleaning and Preprocessing
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)
    df.sort_index(inplace=True)
    df.ffill(inplace=True)  # Forward fill to handle missing values
    df.dropna(inplace=True)

    # Select relevant features
    df = df[FEATURES]

    # Split data into training and testing before scaling to prevent data leakage
    train_size = int(len(df) * 0.7)
    train_df = df.iloc[:train_size]
    test_df = df.iloc[train_size - LAG:]  # Include lag for creating sequences

    # Initialize scaler and fit only on training data
    scaler_features = MinMaxScaler(feature_range=(0, 1))
    scaled_train = scaler_features.fit_transform(train_df)
    scaled_test = scaler_features.transform(test_df)

    # Convert scaled data back to DataFrame for easier handling
    scaled_train_df = pd.DataFrame(scaled_train, columns=FEATURES, index=train_df.index)
    scaled_test_df = pd.DataFrame(scaled_test, columns=FEATURES, index=test_df.index)

    # Create sequences
    train_X, train_y = create_sequences(scaled_train_df, LAG, TARGET_COLUMN)
    test_X, test_y = create_sequences(scaled_test_df, LAG, TARGET_COLUMN)

    # Handle case where test set might be too small after sequence creation
    if len(test_X) == 0:
        print(f"Not enough data to create test sequences for issuer {issuer}. Skipping.\n")
        continue

    # Define callbacks
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True, verbose=1),
    ]

    # Try a few different batch sizes or hyperparams (example loop i in range(1,4))
    for i in range(1, 4):
        print(f"  Model attempt {i} for issuer {issuer}...")

        batch_size = max(1, (len(df) // (i * 10)))  # Example logic for batch size

        # Define model architecture based on data size
        if len(df) >= 200:
            model = Sequential([
                Input(shape=(LAG, train_X.shape[2])),
                Bidirectional(LSTM(64, activation='relu', return_sequences=True)),
                Dropout(0.2),
                Bidirectional(LSTM(32, activation='relu')),
                Dropout(0.2),
                Dense(units=25),
                Dense(1, activation='linear')
            ])
        else:
            model = Sequential([
                Input(shape=(LAG, train_X.shape[2])),
                Bidirectional(LSTM(32, activation='relu', recurrent_dropout=0.1)),
                Dense(25, activation='relu'),
                Dense(1, activation='linear')
            ])

        # Compile the model
        model.compile(
            loss='mean_squared_error',
            optimizer=Adam(learning_rate=0.001),
            metrics=['mean_absolute_error']
        )

        # Train the model
        history = model.fit(
            train_X, train_y,
            validation_split=VALIDATION_SPLIT,  # Use a portion of training data for validation
            epochs=EPOCHS,
            batch_size=batch_size,
            shuffle=False,  # Important for time series data
            callbacks=callbacks,
            verbose=0
        )

        # Make predictions
        pred_y = model.predict(test_X)

        # Inverse transform the predictions and actual values for the target
        target_scaler = MinMaxScaler(feature_range=(0, 1))
        target_scaler.fit(train_df[[TARGET_COLUMN]])

        # Reshape for inverse transformation
        pred_y_inv = target_scaler.inverse_transform(pred_y)
        test_y_inv = target_scaler.inverse_transform(test_y.reshape(-1, 1))

        # Evaluate the model
        r2 = r2_score(test_y_inv, pred_y_inv)
        mae = mean_absolute_error(test_y_inv, pred_y_inv)
        rmse = root_mean_squared_error(test_y_inv, pred_y_inv)

        print(f"    R^2 Score: {r2:.4f}")
        print(f"    MAE: {mae:.4f}")
        print(f"    RMSE: {rmse:.4f}")

        # Track the best model
        if (best_model is None) or (r2 > best_r2_score):
            best_model = model
            best_r2_score = r2
            best_mean_absolute_error = mae
            best_root_mean_squared_error = rmse

    # After trying up to 3 attempts, if a best model is found, save metrics
    if best_model is not None:
        last_trade_price = df[TARGET_COLUMN].iloc[-1]  # The last known price

        # Insert or replace evaluation metrics
        cursor.execute("""
            INSERT OR REPLACE INTO evaluation_metrics 
            (issuer, r2_score, mean_absolute_error, root_mean_squared_error, last_trade_price)
            VALUES (?, ?, ?, ?, ?)
        """, (
            issuer,
            best_r2_score,
            best_mean_absolute_error,
            best_root_mean_squared_error,
            float(last_trade_price)
        ))
        conn.commit()
        print(f"  -> Evaluation metrics for {issuer} saved to the database.\n")

        # --- PREDICT THE NEXT MONTH (30 DAYS) ---
        scaled_df_full = scaler_features.transform(df)
        scaled_df_full = pd.DataFrame(scaled_df_full, columns=FEATURES, index=df.index)

        last_date = df.index[-1]
        future_dates, future_predictions = predict_next_month(
            model=best_model,
            scaled_df=scaled_df_full,
            scaler_features=scaler_features,
            scaler_target=target_scaler,
            lag=LAG,
            start_date=last_date
        )

        # Convert the next 30-day predictions to a DataFrame
        future_df = pd.DataFrame({
            'predicted_price': future_predictions
        }, index=future_dates)

        # 3. Insert the next-month predictions into the next_month_predictions table
        for pred_date, pred_price in zip(future_dates, future_predictions):
            cursor.execute("""
                INSERT INTO next_month_predictions (issuer, date, predicted_price)
                VALUES (?, ?, ?)
            """, (
                issuer,
                pred_date.strftime('%Y-%m-%d'),
                float(pred_price)
            ))
        conn.commit()

        print(f"  -> Next {PRED_DAYS} day predictions for {issuer} saved to the database.")
        print(future_df)
        print("\n" + "=" * 50 + "\n")

# Close the database connection
conn.close()
print("All issuers have been processed and the database connection is closed.")
