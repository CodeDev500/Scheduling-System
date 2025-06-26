import { db } from "../utils/db.server";
import { User } from "../schema/user.schema";

export const listUsers = async (): Promise<User[]> => {
  return db.user.findMany({
    select: {
      id: true,
      image: true,
      firstname: true,
      lastname: true,
      middleInitial: true,
      email: true,
      designation: true,
      department: true,
      role: true,
      status: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getUserById = async (id: number): Promise<User | null> => {
  return db.user.findUnique({
    where: { id },
  });
};

export const createUser = async (data: User): Promise<User> => {
  return db.user.create({
    data,
    select: {
      id: true,
      image: true,
      firstname: true,
      lastname: true,
      middleInitial: true,
      email: true,
      designation: true,
      department: true,
      role: true,
      status: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateUser = async (id: number, data: User): Promise<User> => {
  return db.user.update({
    where: { id },
    data,
    select: {
      id: true,
      image: true,
      firstname: true,
      lastname: true,
      middleInitial: true,
      email: true,
      designation: true,
      department: true,
      role: true,
      status: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const deleteUser = async (id: number): Promise<User> => {
  return db.user.delete({
    where: { id },
  });
};
