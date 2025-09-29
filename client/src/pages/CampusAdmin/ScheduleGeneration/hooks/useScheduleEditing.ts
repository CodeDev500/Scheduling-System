import { useState } from 'react';
import { toast } from 'sonner';
import type { GeneratedSchedule, ScheduleItem, FacultyRecommendation } from '../../../../types';
import { detectConflicts, calculateOptimizationScore } from '../utils/scheduleUtils';
import { mockData } from '../mockData';

export const useScheduleEditing = (
  selectedSchedule: GeneratedSchedule | null,
  setSelectedSchedule: (schedule: GeneratedSchedule | null) => void,
  setGeneratedSchedules: React.Dispatch<React.SetStateAction<GeneratedSchedule[]>>
) => {
  // Editing state
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ScheduleItem>>({});
  const [draggedItem, setDraggedItem] = useState<ScheduleItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);

  // Faculty recommendations state
  const [showFacultyRecommendations, setShowFacultyRecommendations] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  // Inline editing functions
  const handleStartEdit = (item: ScheduleItem) => {
    setEditingItem(item.id);
    setEditFormData({
      startTime: item.startTime,
      endTime: item.endTime,
      day: item.day,
      room: item.room,
      faculty: item.faculty
    });
  };

  const handleSaveEdit = () => {
    if (!editingItem || !selectedSchedule) return;

    const updatedSubjects = selectedSchedule.subjects.map(item => {
      if (item.id === editingItem) {
        const updatedItem = { ...item, ...editFormData };
        return updatedItem;
      }
      return item;
    });

    // Re-run conflict detection on updated schedule
    const { enhancedItems, conflicts } = detectConflicts(updatedSubjects);

    const updatedSchedule = {
      ...selectedSchedule,
      subjects: enhancedItems,
      conflicts: conflicts,
      optimizationScore: calculateOptimizationScore(conflicts)
    };

    setSelectedSchedule(updatedSchedule);
    setGeneratedSchedules(prev => prev.map(schedule => 
      schedule.id === updatedSchedule.id ? updatedSchedule : schedule
    ));

    setEditingItem(null);
    setEditFormData({});
    toast.success('Schedule item updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, item: ScheduleItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDay: string, targetTime: string) => {
    e.preventDefault();
    
    if (!draggedItem || !selectedSchedule) return;

    // Update the dragged item with new time and day
    const updatedSubjects = selectedSchedule.subjects.map(item => {
      if (item.id === draggedItem.id) {
        const updatedItem = {
          ...item,
          day: targetDay,
          startTime: targetTime,
          endTime: addHoursToTime(targetTime, 1.5) // Default 1.5 hour duration
        };
        return updatedItem;
      }
      return item;
    });

    // Re-run conflict detection
    const { enhancedItems, conflicts } = detectConflicts(updatedSubjects);

    const updatedSchedule = {
      ...selectedSchedule,
      subjects: enhancedItems,
      conflicts: conflicts,
      optimizationScore: calculateOptimizationScore(conflicts)
    };

    setSelectedSchedule(updatedSchedule);
    setGeneratedSchedules(prev => prev.map(schedule => 
      schedule.id === updatedSchedule.id ? updatedSchedule : schedule
    ));

    setDraggedItem(null);
    toast.success('Schedule item moved successfully!');
  };

  // Helper function to add hours to time
  const addHoursToTime = (time: string, hours: number): string => {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Enhanced faculty recommendation algorithm
  const getFacultyRecommendations = (subject: any, excludeFacultyId?: string): FacultyRecommendation[] => {
    return mockData.faculty
      .filter(faculty => faculty.id !== excludeFacultyId)
      .map(faculty => {
        let matchScore = 0;
        const reasons: string[] = [];
        
        // Specialization matching (40% weight)
        const subjectKeywords = [
          subject.name.toLowerCase(),
          subject.code.toLowerCase(),
          ...(subject.description || '').toLowerCase().split(' ')
        ];

        const facultySpecializations = faculty.specializations.map(s => s.toLowerCase());
        const specializationMatch = subjectKeywords.some(keyword => 
          facultySpecializations.some(spec => spec.includes(keyword) || keyword.includes(spec))
        );

        if (specializationMatch) {
          matchScore += 40;
          reasons.push('Specialization match');
        }

        // Experience matching (30% weight)
        const hasSubjectExperience = faculty.subjectExperience.some(exp => exp.subjectId === subject.id);
        if (hasSubjectExperience) {
          matchScore += 30;
          reasons.push('Previous subject experience');
        }

        // Workload consideration (20% weight)
        const currentWorkload = faculty.currentWorkload || 0;
        if (currentWorkload < 20) {
          matchScore += 20;
          reasons.push('Available capacity');
        } else if (currentWorkload < 30) {
          matchScore += 10;
          reasons.push('Moderate availability');
        }

        // Rating consideration (10% weight)
        const rating = faculty.rating || 0;
        if (rating >= 4.5) {
          matchScore += 10;
          reasons.push('Excellent rating');
        } else if (rating >= 4.0) {
          matchScore += 5;
          reasons.push('Good rating');
        }

        return {
          faculty,
          matchScore,
          reasons,
          availability: currentWorkload < 30,
          workload: currentWorkload
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Return top 5 recommendations
  };

  return {
    // Editing state
    editingItem,
    editFormData,
    setEditFormData,
    draggedItem,
    selectedItems,
    setSelectedItems,
    bulkEditMode,
    setBulkEditMode,

    // Faculty recommendations state
    showFacultyRecommendations,
    setShowFacultyRecommendations,
    selectedSubject,
    setSelectedSubject,

    // Functions
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDragStart,
    handleDragOver,
    handleDrop,
    getFacultyRecommendations
  };
};
