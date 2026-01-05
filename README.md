
# Smart Mosquito Control System




## Project Overview

The Smart Mosquito Control System is an integrated solution designed to reduce the spread of mosquito-borne diseases such as dengue, malaria, and chikungunya. The project addresses limitations in existing mosquito control methods by combining smart trapping, accurate mosquito identification, predictive analytics, and hospital data–driven alerting.

The system is designed for real-world deployment in Sri Lanka, considering local environmental conditions, health system constraints, and data availability. It shifts dengue control from reactive response to proactive prevention through early detection, forecasting, and timely alerts.


## System Architecture

The system consists of four main components that work together through a centralized backend and shared data infrastructure.

<img width="1562" height="1241" alt="image" src="https://github.com/user-attachments/assets/ebc777da-9fee-4cbf-9172-4df06c5f57df" />



## Component 1: Smart Selective Mosquito Trap

Traditional mosquito traps are non-selective and often harm beneficial insects, disrupt ecosystems, and provide no real-time data. This limits their effectiveness and increases strain on urban health systems.

To address this, the system introduces a smart selective mosquito trap with the following behavior:

- Mosquitoes are attracted using a controlled CO₂ source

- Insects entering the trap are analyzed

- If confirmed as mosquitoes, they are eliminated using an electric shock

- If the insect is not a mosquito, a fan mechanism safely removes it from the trap

This approach ensures targeted mosquito control while minimizing ecological harm and enabling continuous data collection.
## Component 2: Mosquito Identification and Classification

Existing mosquito identification systems are unsuitable for Sri Lanka due to environmental challenges such as low lighting, background noise, and fast insect movement. Single-method systems often fail in real-world conditions.

This component focuses on identifying mosquitoes captured in the trap, including:

- Detecting whether the insect is a mosquito

- Identifying the mosquito species or breed

- Recording which species are being captured over time

- Using historical capture data to support trend analysis and prediction

The identification process is optimized for local mosquito species and real deployment conditions, improving accuracy and reducing false detections.


## Component 3: Predictive Analytics and Risk Forecasting Engine

This component enables proactive dengue control through data-driven forecasting.

A Predictive Analytics Engine integrates:

- A MERN stack web dashboard for visualization and interaction

- A Python-based machine learning core for prediction

Key features include:

- Automated processing of historical MOH dengue data

- Integration of weather variables with time-lag effects

- Dengue density prediction using a Random Forest Regressor

- 7-day forecasts and spatial risk maps with up to 14-day lead time

- Real-time dashboards and automated PDF report generation

This allows health officials to plan targeted fogging, allocate resources efficiently, and act before outbreaks escalate.
## Component 4: Hospital Data Integration and Alert System

This component focuses on public health data integration and early warning.

It combines:

- Hospital-reported patient data for dengue and other mosquito-borne diseases

- Historical outbreak records

- Weather data for predictive modeling

The system:

- Analyzes trends in hospital case counts

- Predicts future risk levels based on combined health and environmental data

- Generates alerts for health authorities and relevant stakeholders

- Supports timely decision-making and community-level interventions

This component strengthens coordination between hospitals, health authorities, and predictive systems.
## Project Dependencies 

**Backend and Analytics**

- Node.js

- Express.js

- MongoDB

- Python

- Scikit-learn (Random Forest Regressor)

- Firebase

- YOLOv8

**Web Application**

- React

- React Native

- JavaScript

- Tailwand CSS

- Leaflet.js

**Data Sources**

- MOH dengue and disease records

- Hospital patient data

- Weather data (historical and real-time)

- Mosquito Species(Images)

**Development Tools**

- Git and GitHub for version control

- Postman for API testing

- VS Code
