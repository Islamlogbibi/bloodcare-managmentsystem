-- MongoDB collection setup for users
-- This script creates the users collection with proper indexes

-- Create users collection with validation schema
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "fullName", "role", "department", "isActive", "createdAt"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "must be a valid email address"
        },
        password: {
          bsonType: "string",
          minLength: 6,
          description: "must be a string with at least 6 characters"
        },
        fullName: {
          bsonType: "string",
          minLength: 2,
          description: "must be a string with at least 2 characters"
        },
        role: {
          bsonType: "string",
          enum: ["admin", "doctor", "assistant"],
          description: "must be one of: admin, doctor, assistant"
        },
        department: {
          bsonType: "string",
          description: "must be a string"
        },
        phone: {
          bsonType: ["string", "null"],
          description: "must be a string or null"
        },
        isActive: {
          bsonType: "bool",
          description: "must be a boolean"
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date"
        },
        lastLogin: {
          bsonType: ["date", "null"],
          description: "must be a date or null"
        }
      }
    }
  }
});

-- Create unique index on email
db.users.createIndex({ "email": 1 }, { unique: true });

-- Create index on role for efficient role-based queries
db.users.createIndex({ "role": 1 });

-- Create index on isActive for filtering active users
db.users.createIndex({ "isActive": 1 });

-- Create compound index for active users by role
db.users.createIndex({ "isActive": 1, "role": 1 });
