import sqlite3
import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import r2_score, mean_absolute_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional, Input
from tensorflow.keras.optimizers import Adam
import seaborn as sns
# Constants
DB_PATH = "../../../database/stock_data.db"
MODELS_DIR = "../../models"
WINDOW_SIZE = 7
EPOCHS = 64
FEATURES = ["last_trade_price", "percent_change", "volume"]
TARGET_COLUMN = "last_trade_price"  # Column to predict
LAG = 7  # Using WINDOW_SIZE for consistency
MIN_SAMPLES = 100

# Establish database connection
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Create the evaluation_metrics table if it does not exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS evaluation_metrics (
    issuer TEXT PRIMARY KEY,
    r2_score REAL,
    mean_absolute_error REAL
)
""")
conn.commit()


def get_unique_issuers(conn):
    """Retrieve a list of unique issuers from the database."""
    query = "SELECT DISTINCT issuer FROM stock_data"
    df = pd.read_sql(query, conn)
    return df['issuer'].tolist()


def load_issuer_data(conn, issuer):
    """Load historical stock data for a specific issuer, sorted by date."""
    query = f"""
    SELECT issuer, date, last_trade_price, max, min, avg_price, percent_change, volume, turnover_best, total_turnover
    FROM stock_data
    WHERE issuer = ?
    ORDER BY date ASC
    """
    df = pd.read_sql(query, conn, params=(issuer,))
    return df


# Retrieve all unique issuers
issuers = get_unique_issuers(conn)

for issuer in issuers:
    print(f"Processing issuer: {issuer}")

    # Load data for the current issuer
    df = load_issuer_data(conn, issuer)

    # Check if the issuer has enough data
    if len(df) < MIN_SAMPLES:
        print(
            f"Skipping issuer {issuer} due to insufficient data ({len(df)} samples). Minimum required is {MIN_SAMPLES}.\n")
        continue  # Skip to the next issuer

    # Data Cleaning and Preprocessing
    df.set_index('date', inplace=True)
    df.sort_index(inplace=True)
    df.ffill(inplace=True)  # Forward fill to handle missing values

    # Select relevant features
    df = df[FEATURES]

    print(df.size)
    BATCH_SIZE = max(12, df.size // 50)
    print(BATCH_SIZE)

    # Split data into training and testing before scaling to prevent data leakage
    train_size = int(len(df) * 0.7)
    train_df = df.iloc[:train_size]
    test_df = df.iloc[train_size - LAG:]  # Include lag for creating sequences

    # Initialize scaler and fit only on training data
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_train = scaler.fit_transform(train_df)
    scaled_test = scaler.transform(test_df)

    # Convert scaled data back to DataFrame for easier handling
    scaled_train_df = pd.DataFrame(scaled_train, columns=FEATURES, index=train_df.index)
    scaled_test_df = pd.DataFrame(scaled_test, columns=FEATURES, index=test_df.index)


    def create_sequences(data, lag, target_column):
        """Create sequences of data for LSTM."""
        X, y = [], []
        for i in range(lag, len(data)):
            X.append(data.iloc[i - lag:i].values)
            y.append(data[target_column].iloc[i])
        return np.array(X), np.array(y)


    # Create sequences
    train_X, train_y = create_sequences(scaled_train_df, LAG, TARGET_COLUMN)
    test_X, test_y = create_sequences(scaled_test_df, LAG, TARGET_COLUMN)

    if len(df) > 250:
        # Build the LSTM model
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
            Input((LAG, (train_X.shape[2]))),
            LSTM(32, recurrent_dropout=0.1),
            Dense(units=25),
            Dense(1, activation='linear')
        ])

    # Compile the model
    model.compile(
        loss='mean_squared_error',
        optimizer=Adam(learning_rate=0.001),
        metrics=['mean_squared_error']
    )

    # Train the model
    history = model.fit(
        train_X, train_y,
        validation_split=0.3,  # Use a portion of training data for validation
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        shuffle=False  # Important for time series data
    )

    # Make predictions
    pred_y = model.predict(test_X)

    # Inverse transform the predictions and actual values if needed
    # Assuming the target was scaled, we need to inverse transform
    # Create a temporary scaler for the target
    target_scaler = MinMaxScaler(feature_range=(0, 1))
    # Fit only on training target
    target_scaler.fit(train_df[[TARGET_COLUMN]])

    # Inverse transform
    pred_y_inv = target_scaler.inverse_transform(pred_y)
    test_y_inv = target_scaler.inverse_transform(test_y.reshape(-1, 1))

    # Evaluate the model
    r2 = r2_score(test_y_inv, pred_y_inv)
    mae = mean_absolute_error(test_y_inv, pred_y_inv)
    print(f"R^2 Score for {issuer}: {r2:.4f}")
    print(f"Mean Absolute Error for {issuer}: {mae:.4f}")

    # Save the model to the MODELS_DIR
    model_filename = f"model_{issuer}.h5"
    model_path = os.path.join(MODELS_DIR, model_filename)
    model.save(model_path)
    print(f"Model saved to {model_path}")

    # Insert evaluation metrics into the evaluation_metrics table
    cursor.execute("""
    INSERT OR REPLACE INTO evaluation_metrics (issuer, r2_score, mean_absolute_error)
    VALUES (?, ?, ?)
    """, (issuer, r2, mae))
    conn.commit()
    print(f"Evaluation metrics for {issuer} saved to the database.\n")

# Close the database connection
conn.close()
print("All issuers have been processed and the database connection is closed.")
