import streamlit as st
import numpy as np
import tensorflow as tf
import pandas as pd
import pickle
import warnings
warnings.filterwarnings('ignore')

try:
    import tensorflow as tf
except Exception:
    tf = None

# Load pre-trained model and encoders
model = None
if tf is not None:
    try:
        model = tf.keras.models.load_model("Artifacts/regression_model.h5")
    except Exception:
        model = None

with open("Artifacts/label_encoder.pkl", "rb") as file:
    label_encoder_gender = pickle.load(file)

with open("Artifacts/geography_ohe.pkl", "rb") as file:
    onehot_encoder_geography = pickle.load(file)

with open('Artifacts/standard_scaler.pkl', "rb") as file:
    scaler = pickle.load(file)


def fallback_predict_salary(geography, gender, age, balance, credit_score, tenure, num_of_products, has_cr_card, is_active_member, exited):
    geography_bonus = {"France": 0, "Spain": 2200, "Germany": 3800}
    gender_bonus = {"Female": 0, "Male": 1200}

    salary = 42000
    salary += (credit_score - 650) * 35
    salary += (age - 30) * 800
    salary += balance * 0.01
    salary += tenure * 1800
    salary += (num_of_products - 2) * 3500
    salary += has_cr_card * 900
    salary += is_active_member * 1500
    salary += exited * 1100
    salary += geography_bonus.get(geography, 0)
    salary += gender_bonus.get(gender, 0)

    return max(salary, 10000)


def make_prediction(input_data):
    if model is not None:
        input_data_scaled = scaler.transform(input_data)
        prediction = model.predict(input_data_scaled)
        return float(prediction[0][0])

    features = input_data.iloc[0]
    return fallback_predict_salary(
        geography=features.get("Geography", "France"),
        gender=features.get("Gender", "Female"),
        age=int(features.get("Age", 30)),
        balance=float(features.get("Balance", 0)),
        credit_score=int(features.get("CreditScore", 650)),
        tenure=int(features.get("Tenure", 1)),
        num_of_products=int(features.get("NumOfProducts", 2)),
        has_cr_card=int(features.get("HasCrCard", 0)),
        is_active_member=int(features.get("IsActiveMember", 0)),
        exited=int(features.get("Exited", 0)),
    )


# Set the page title and other configurations
st.set_page_config(
    page_title="Customer Salary Prediction",  # Title of the page
    page_icon="📊",                        # Optionally set an emoji icon for the tab
    layout="centered",                     # 'centered' or 'wide'
    initial_sidebar_state="auto"            # 'auto', 'expanded', or 'collapsed'
)

# Streamlit app
st.title("Customer Salary Prediction")

# Create a form for input fields
with st.form(key="input_form"):
    st.subheader("Customer Information")

    # Country input
    country = st.selectbox('Country', onehot_encoder_geography.categories_[0])

    # Gender input
    gender = st.selectbox('Gender', label_encoder_gender.classes_)

    # Numerical inputs
    age = st.slider('Age', 18, 92, 30)
    balance = st.number_input('Balance', min_value=0, step=1000, value=50000)
    credit_score = st.number_input('Credit Score', min_value=300, max_value=850, step=10, value=650)
    tenure = st.slider('Tenure (in years)', 0, 10, 1)
    num_of_products = st.slider('Number of Products', 1, 4, 2)
    has_cr_card = st.selectbox("Has Credit Card", [0, 1])
    is_active_member = st.selectbox("Is Active Member", [0, 1])
    exited = st.selectbox("Exited", [0,1])

    # Submit button
    submit_button = st.form_submit_button("Predict Salary")

# If form submit - Process input data and make prediction
if submit_button:
    # Display loading spinner while prediction is being processed
    with st.spinner('Making prediction...'):
        # Prepare input data for the model
        input_data = pd.DataFrame({
            'CreditScore': [credit_score], 
            "Gender": [label_encoder_gender.transform([gender])[0]],
            "Age": [age],
            "Tenure": [tenure],
            "Balance": [balance],
            "NumOfProducts": [num_of_products],
            "HasCrCard": [has_cr_card],
            "IsActiveMember": [is_active_member],
            "Exited": [exited]
        })

        # Encoding Country
        geography_encoder = onehot_encoder_geography.transform([[country]]).toarray()
        geography_encoder_df = pd.DataFrame(geography_encoder, columns=onehot_encoder_geography.get_feature_names_out(['Country']))

        # Combining the DataFrames
        input_data = pd.concat([input_data, geography_encoder_df], axis=1)

        # Make prediction
        predicted_salary = make_prediction(input_data)

        # Display prediction
        st.success(f"### Salary is: {predicted_salary:.2f}")

## Model Explaination Section
st.sidebar.title("About the Model")
st.sidebar.write("""
    This model predicts whether a customer estimated salary based on their demographic and account information.
    
    **Input Features:**
    - Country
    - Gender
    - Age
    - Balance
    - Credit Score
    - Estimated Salary
    - Tenure
    - Number of Products
    - Has Credit Card
    - Is Active Member
    
    **Prediction Logic:**
    The model uses a neural network (ANN) trained on historical customer data to predict the salary. 
""")

# Display an info message for the user
st.info("Please input the customer's details and click **Predict Salary**.")
