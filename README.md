# Aircraft Subsystem Predictive Maintenance API

This project implements a **machine learning-powered API** for real-time predictive maintenance of key aircraft systems. Using both deep learning and classical machine learning models, the system forecasts component health and estimates remaining useful life (RUL), enabling early detection of potential failures and optimized maintenance scheduling.

---

## System Overview

### Multi-Model Architecture

- **Deep learning models (LSTM networks)** trained on time-series sequence data for individual subsystems.
- **Classical ML model (Random Forest or XGBoost via Scikit-Learn)** for engine-level prediction using tabular features.

### Subsystems Modeled

- Hydraulic system  
- Electrical system  
- Control surfaces  
- Cabin environmental system  
- Altimeter  
- Full engine system

### Data-Driven Approach

- Each subsystem model is trained on simulated or collected flight sensor data.
- Dedicated scalers for input normalization and target transformation ensure accurate predictions.

---

## API Design

Built with **FastAPI (Python)** for lightweight, asynchronous REST API serving.  
Accepts **JSON POST requests** containing sequence data for inference.

### Endpoints

#### Predict Remaining Useful Life

**POST** `/predict/{subsystem}`

- `{subsystem}` options:
  - `hydraulic`
  - `electrical`
  - `control_surface`
  - `cabin`
  - `altimeter`
  - `engine`

- **Input**:  
  - Subsystem models expect sequences of time-series data (sequence length = 50).  
  - Engine model expects flat tabular feature arrays.

- **Inference Logic**:  
  - Models and preprocessing scalers are loaded into memory at service startup for fast, low-latency inference.
  - Supports both **PyTorch (.pt)** models for LSTMs and **Scikit-Learn (.pkl)** models.

---

## Deployment Architecture

- Fully containerized with **Docker** for reproducibility.
- Deployed using **Google Cloud Run** for fully managed, serverless infrastructure.
- Image builds handled by **Google Cloud Build** directly from the source repository.
- Scales automatically with incoming request volume; no manual infrastructure management required.

---

## Use Cases

- Predictive aircraft maintenance & fleet management
- Proactive fault detection and diagnostics
- Aviation safety monitoring and optimization
- Demonstration of time-series modeling applied to industrial equipment health monitoring

---

## Technologies Used

- Python 3.10
- FastAPI
- PyTorch
- Scikit-Learn
- Google Cloud Platform (Cloud Run, Cloud Build)
- Docker

---
 **Ready for real-world deployment and public demonstration of predictive maintenance ML systems.**
