import { User } from "@prisma/client";
import * as UserService from "../services/user.service";
import { Request, Response } from "express";

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(parseInt(id));

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFacultyByDepartment = async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const faculty = await UserService.getFacultyByDepartment(department);

    res.status(200).json(faculty);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllFaculty = async (req: Request, res: Response) => {
  try {
    const faculty = await UserService.listUsers();
    const filteredFaculty = faculty.filter(user => user.role === 'FACULTY' );

    res.status(200).json(filteredFaculty);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getInstructor = async (req: Request, res: Response) => {
  try {
    const instructors = await UserService.getInstructors()
    res.status(200).json(instructors);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
}

