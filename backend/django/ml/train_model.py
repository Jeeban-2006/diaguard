"""
Machine Learning Training Script for DiaguARd
Trains a diabetes risk prediction model using Logistic Regression and Random Forest.

Usage:
    python train_model.py
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score, confusion_matrix
import joblib


def generate_synthetic_dataset(n_samples=1000):
    """
    Generate synthetic diabetes dataset mimicking Pima Indians Diabetes Dataset.
    
    Features:
    - age: 20-80 years
    - bmi: 15-50
    - glucose: 60-200 mg/dL
    - blood_pressure_systolic: 80-200 mmHg
    - hba1c: 4.0-12.0%
    - physical_activity: 0-300 minutes/week
    - sleep_hours: 3-12 hours
    - stress_level: 1-10
    - smoking: 0 (never), 1 (former), 2 (current)
    - family_history: 0 (no), 1 (yes)
    
    Target:
    - diabetes_risk: 0 (low risk), 1 (high risk)
    """
    np.random.seed(42)
    
    # Generate features with realistic correlations
    age = np.random.normal(45, 15, n_samples).clip(20, 80)
    bmi = np.random.normal(28, 6, n_samples).clip(15, 50)
    glucose = np.random.normal(110, 30, n_samples).clip(60, 200)
    blood_pressure = np.random.normal(120, 20, n_samples).clip(80, 200)
    hba1c = np.random.normal(5.7, 1.2, n_samples).clip(4.0, 12.0)
    
    physical_activity = np.random.exponential(60, n_samples).clip(0, 300)
    sleep_hours = np.random.normal(7, 1.5, n_samples).clip(3, 12)
    stress_level = np.random.poisson(5, n_samples).clip(1, 10)
    
    smoking = np.random.choice([0, 1, 2], n_samples, p=[0.6, 0.25, 0.15])
    family_history = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
    
    # Create risk score based on clinical guidelines
    risk_score = (
        (age - 20) * 0.5 +
        (bmi - 18.5) * 2.5 +
        (glucose - 70) * 0.8 +
        (blood_pressure - 90) * 0.3 +
        (hba1c - 4.5) * 10 +
        (60 - physical_activity) * 0.2 +
        (7 - sleep_hours) * 5 +
        stress_level * 3 +
        smoking * 15 +
        family_history * 20
    )
    
    # Add noise
    risk_score += np.random.normal(0, 10, n_samples)
    
    # Convert to binary classification (threshold at median)
    threshold = np.percentile(risk_score, 60)
    diabetes_risk = (risk_score > threshold).astype(int)
    
    # Create DataFrame
    data = pd.DataFrame({
        'age': age,
        'bmi': bmi,
        'glucose': glucose,
        'blood_pressure': blood_pressure,
        'hba1c': hba1c,
        'physical_activity': physical_activity,
        'sleep_hours': sleep_hours,
        'stress_level': stress_level,
        'smoking': smoking,
        'family_history': family_history,
        'diabetes_risk': diabetes_risk
    })
    
    return data


def train_models():
    """
    Train and save machine learning models for diabetes risk prediction.
    """
    print("=" * 60)
    print("DiaguARd ML Training Pipeline")
    print("=" * 60)
    
    # Generate dataset
    print("\n[1/6] Generating synthetic diabetes dataset...")
    data = generate_synthetic_dataset(n_samples=1000)
    print(f"   Dataset shape: {data.shape}")
    print(f"   Positive cases: {data['diabetes_risk'].sum()} ({data['diabetes_risk'].mean()*100:.1f}%)")
    
    # Split features and target
    print("\n[2/6] Splitting features and target...")
    X = data.drop('diabetes_risk', axis=1)
    y = data['diabetes_risk']
    
    feature_names = X.columns.tolist()
    print(f"   Features: {', '.join(feature_names)}")
    
    # Train-test split
    print("\n[3/6] Creating train-test split (80-20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   Training samples: {len(X_train)}")
    print(f"   Testing samples: {len(X_test)}")
    
    # Feature scaling
    print("\n[4/6] Normalizing features with StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    print(f"   Scaler fitted on {X_train_scaled.shape[1]} features")
    
    # Train Logistic Regression (Primary Model)
    print("\n[5/6] Training Logistic Regression model...")
    lr_model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        class_weight='balanced',
        solver='liblinear'
    )
    lr_model.fit(X_train_scaled, y_train)
    
    # Evaluate Logistic Regression
    lr_pred = lr_model.predict(X_test_scaled)
    lr_pred_proba = lr_model.predict_proba(X_test_scaled)[:, 1]
    
    lr_accuracy = accuracy_score(y_test, lr_pred)
    lr_auc = roc_auc_score(y_test, lr_pred_proba)
    
    print(f"\n   Logistic Regression Results:")
    print(f"   - Accuracy: {lr_accuracy:.4f}")
    print(f"   - ROC-AUC: {lr_auc:.4f}")
    print(f"\n   Classification Report:")
    print(classification_report(y_test, lr_pred, target_names=['Low Risk', 'High Risk']))
    
    # Train Random Forest (Secondary Model)
    print("\n   Training Random Forest model...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Evaluate Random Forest
    rf_pred = rf_model.predict(X_test_scaled)
    rf_pred_proba = rf_model.predict_proba(X_test_scaled)[:, 1]
    
    rf_accuracy = accuracy_score(y_test, rf_pred)
    rf_auc = roc_auc_score(y_test, rf_pred_proba)
    
    print(f"\n   Random Forest Results:")
    print(f"   - Accuracy: {rf_accuracy:.4f}")
    print(f"   - ROC-AUC: {rf_auc:.4f}")
    
    # Feature importance from Random Forest
    print(f"\n   Top 5 Important Features (Random Forest):")
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': rf_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head().iterrows():
        print(f"   {row['feature']:20s}: {row['importance']:.4f}")
    
    # Save models
    print("\n[6/6] Saving models and artifacts...")
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Save primary model (Logistic Regression)
    model_path = os.path.join(script_dir, 'diabetes_model.pkl')
    joblib.dump(lr_model, model_path)
    print(f"   [OK] Saved Logistic Regression model: {model_path}")
    
    # Save secondary model (Random Forest)
    rf_model_path = os.path.join(script_dir, 'diabetes_model_rf.pkl')
    joblib.dump(rf_model, rf_model_path)
    print(f"   [OK] Saved Random Forest model: {rf_model_path}")
    
    # Save scaler
    scaler_path = os.path.join(script_dir, 'scaler.pkl')
    joblib.dump(scaler, scaler_path)
    print(f"   [OK] Saved StandardScaler: {scaler_path}")
    
    # Save feature names
    feature_names_path = os.path.join(script_dir, 'feature_names.pkl')
    joblib.dump(feature_names, feature_names_path)
    print(f"   [OK] Saved feature names: {feature_names_path}")
    
    # Save metadata
    metadata = {
        'model_type': 'Logistic Regression',
        'feature_names': feature_names,
        'train_accuracy': lr_accuracy,
        'train_auc': lr_auc,
        'rf_accuracy': rf_accuracy,
        'rf_auc': rf_auc,
        'n_samples': len(data),
        'n_features': len(feature_names),
        'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    metadata_path = os.path.join(script_dir, 'model_metadata.pkl')
    joblib.dump(metadata, metadata_path)
    print(f"   [OK] Saved metadata: {metadata_path}")
    
    print("\n" + "=" * 60)
    print("[OK] Training complete! Models ready for deployment.")
    print("=" * 60)
    
    return {
        'lr_model': lr_model,
        'rf_model': rf_model,
        'scaler': scaler,
        'feature_names': feature_names,
        'accuracy': lr_accuracy,
        'auc': lr_auc
    }


if __name__ == '__main__':
    train_models()
