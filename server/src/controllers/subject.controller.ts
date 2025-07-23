import * as SubjectSlice from "../services/subject.service";
import { Request, Response } from "express";

export const addSubject = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const subject = await SubjectSlice.createSubject(data);
    res.status(200).json(subject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await SubjectSlice.listSubjects();
    res.status(200).json(subjects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const subject = await SubjectSlice.getSubjectById(parseInt(id));
    res.status(200).json(subject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const subject = await SubjectSlice.updateSubjectData(parseInt(id), data);
    res.status(200).json(subject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const subject = await SubjectSlice.deleteSubject(parseInt(id));
    res.status(200).json(subject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const searchSubject = async (req: Request, res: Response) => {
  const { query } = req.params;
  try {
    const subjects = await SubjectSlice.searchSubjectQuery(query);
    res.status(200).json(subjects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
