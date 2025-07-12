import { db } from "../utils/db.server";
import { User } from "@prisma/client";
import { statusList, UserStatus } from "../constants/constants";
import { UserRegisterInput } from "../schema/user.schema";

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

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return db.user.findFirst({
    where: {
      email,
      status: {
        in: [statusList.VERIFIED, statusList.APPROVED],
      },
    },
  });
};

export const createUser = async (
  data: UserRegisterInput
): Promise<UserRegisterInput> => {
  const {
    image,
    firstname,
    lastname,
    middleInitial,
    email,
    designation,
    department,
    password,
    role,
    status,
  } = data;

  return db.user.create({
    data: {
      image,
      firstname,
      lastname,
      middleInitial,
      email,
      designation,
      department,
      password,
      role,
      status,
    },
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
export const updateUser = async (
  id: number,
  data: UserRegisterInput
): Promise<UserRegisterInput> => {
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

export const updatePassword = async (email: string, password: string) => {
  return db.user.update({
    where: { email },
    data: { password },
  });
};

export const updateStatus = async (
  email: string,
  status: UserStatus
): Promise<User> => {
  return db.user.update({
    where: { email },
    data: { status },
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

export const deleteUserByEmail = async (
  email: string
): Promise<User | null> => {
  const existingUser = await db.user.findFirst({
    where: {
      email,
      status: statusList.PENDING,
    },
  });

  if (!existingUser) return null;

  return db.user.delete({
    where: { id: existingUser.id },
  });
};
