import { getDatabase } from "@/lib/mongodb"
import { hashPassword, verifyPassword, type User, type UserRole } from "@/lib/auth"
import { ObjectId } from "mongodb"

export interface CreateUserData {
  email: string
  password: string
  fullName: string
  role: UserRole
  department: string
  phone?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

class UserService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection("users")
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const collection = await this.getCollection()

    // Check if user already exists
    const existingUser = await collection.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Create user document
    const userDoc = {
      email: userData.email,
      password: hashedPassword,
      fullName: userData.fullName,
      role: userData.role,
      department: userData.department,
      phone: userData.phone,
      isActive: true,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(userDoc)

    // Return user without password
    const { password, ...userWithoutPassword } = userDoc
    return {
      ...userWithoutPassword,
      _id: result.insertedId.toString(),
    } as User
  }

  async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    const collection = await this.getCollection()

    const user = await collection.findOne({
      email: credentials.email,
      isActive: true,
    })

    if (!user) {
      return null
    }

    const isValidPassword = await verifyPassword(credentials.password, user.password)
    if (!isValidPassword) {
      return null
    }

    // Update last login
    await collection.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    // Return user without password
    const { password, ...userWithoutPassword } = user
    return {
      ...userWithoutPassword,
      _id: user._id.toString(),
    } as User
  }

  async getUserById(userId: string): Promise<User | null> {
    const collection = await this.getCollection()

    const user = await collection.findOne({
      _id: new ObjectId(userId),
      isActive: true,
    })

    if (!user) {
      return null
    }

    const { password, ...userWithoutPassword } = user
    return {
      ...userWithoutPassword,
      _id: user._id.toString(),
    } as User
  }

  async getAllUsers(): Promise<User[]> {
    const collection = await this.getCollection()

    const users = await collection.find({ isActive: true }, { projection: { password: 0 } }).toArray()

    return users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    })) as User[]
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User | null> {
    const collection = await this.getCollection()

    const { _id, ...dataToUpdate } = updateData

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: dataToUpdate },
      { returnDocument: "after", projection: { password: 0 } },
    )

    if (!result) {
      return null
    }

    return {
      ...result,
      _id: result._id.toString(),
    } as User
  }

  async deactivateUser(userId: string): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne({ _id: new ObjectId(userId) }, { $set: { isActive: false } })

    return result.modifiedCount > 0
  }
}

export const userService = new UserService()
