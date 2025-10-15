// User utilities module for UMD federation

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

export function getUserData(userId: number): User {
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    age: Math.floor(Math.random() * 50) + 18,
    isActive: Math.random() > 0.3,
  };
}

export function createUser(name: string, email: string): User {
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    name,
    email,
    age: Math.floor(Math.random() * 50) + 18,
    isActive: true,
  };
}

export function validateUser(user: User): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!user.name || user.name.length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (!user.email || !user.email.includes("@")) {
    errors.push("Valid email is required");
  }

  if (user.age < 18 || user.age > 120) {
    errors.push("Age must be between 18 and 120");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Default export for UMD compatibility
const UserUtils = {
  getUserData,
  createUser,
  validateUser,
};

export default UserUtils;

// Log when module is loaded
if (typeof console !== "undefined") {
  console.log("🧑 UserUtils module loaded successfully!");
}
