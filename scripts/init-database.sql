-- MongoDB doesn't use SQL, but here's the equivalent structure for reference
-- This would be implemented in MongoDB as collections

-- Patients Collection Structure
{
  "_id": "ObjectId",
  "firstName": "String",
  "lastName": "String", 
  "dateOfBirth": "Date",
  "gender": "String",
  "bloodType": "String",
  "phone": "String",
  "email": "String",
  "address": "String",
  "emergencyContact": "String",
  "emergencyPhone": "String",
  "medicalHistory": "String",
  "admissionDate": "Date",
  "lastDonationDate": "Date",
  "weight": "Number",
  "height": "Number", 
  "hemoglobinLevel": "Number",
  "hasF": "Boolean",
  "hasC": "Boolean",
  "hasL": "Boolean",
  "patientCategory": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}

-- Transfusions Collection Structure
{
  "_id": "ObjectId",
  "patientId": "ObjectId",
  "scheduledDate": "Date",
  "scheduledTime": "Date",
  "priority": "String", -- 'regular' or 'urgent'
  "status": "String", -- 'scheduled', 'in-progress', 'completed', 'cancelled'
  "bloodUnits": "Number",
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}

-- Indexes for better performance
-- db.patients.createIndex({ "lastName": 1, "firstName": 1 })
-- db.patients.createIndex({ "bloodType": 1 })
-- db.patients.createIndex({ "phone": 1 })
-- db.patients.createIndex({ "patientCategory": 1 })
-- db.transfusions.createIndex({ "scheduledDate": 1 })
-- db.transfusions.createIndex({ "patientId": 1 })
-- db.transfusions.createIndex({ "priority": 1, "status": 1 })
