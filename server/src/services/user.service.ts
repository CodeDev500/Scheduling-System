import { db } from "../utils/db.server";
import { User, UserRoles } from "@prisma/client";
import { statusList, UserStatus } from "../constants/constants";
import { UserRegisterInput } from "../schema/user.schema";

export const listUsers = async (): Promise<User[]> => {
  return db.user.findMany({
    where: {
      status: {
        in: [statusList.VERIFIED, statusList.APPROVED],
      },
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
      specialization: true,
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
    select: {
      id: true,
      image: true,
      firstname: true,
      lastname: true,
      middleInitial: true,
      email: true,
      designation: true,
      department: true,
      specialization: true,
      role: true,
      status: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
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
    select: {
      id: true,
      image: true,
      firstname: true,
      lastname: true,
      middleInitial: true,
      email: true,
      designation: true,
      department: true,
      specialization: true,
      role: true,
      status: true,
      password: true,
      createdAt: true,
      updatedAt: true,
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
    specialization,
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
      specialization: specialization as any, // Type assertion for JSON field
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
      specialization: true,
      role: true,
      status: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  }) as Promise<UserRegisterInput>;
};
export const updateUser = async (
  id: number,
  data: Partial<UserRegisterInput>
): Promise<UserRegisterInput> => {
  // Parse specialization if it's a string
  let specialization = data.specialization;
  if (typeof data.specialization === 'string') {
    try {
      specialization = JSON.parse(data.specialization);
    } catch (e) {
      specialization = data.specialization;
    }
  }

  return db.user.update({
    where: { id },
    data: {
      ...data,
      specialization: specialization as any, // Type assertion for JSON field
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
      specialization: true,
      role: true,
      status: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  }) as Promise<UserRegisterInput>;
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
      specialization: true,
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

export const getFacultyByDepartment = async (department: string): Promise<User[]> => {
  return db.user.findMany({
    where: {
      department,
      role: 'FACULTY',
      status: {
        in: [statusList.VERIFIED, statusList.APPROVED],
      },
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
      specialization: true,
      role: true,
      status: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getInstructors = async (): Promise<User[]> => {
  return db.user.findMany({
    where: {
      role: {
        in: [UserRoles.FACULTY, UserRoles.DEPARTMENT_HEAD, UserRoles.CAMPUS_ADMIN],
      },
      status: {
        in: [statusList.APPROVED],
      },
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
      specialization: true,
      role: true,
      status: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};