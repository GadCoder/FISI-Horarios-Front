import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";

type CourseCellProps = {
  name: string;
  sectionNumber: number;
  duration: number;
  assignedColors: { [key: string]: string };
  onDelete: (courseName: string) => void;
  isDeleteButtonVisible: boolean;
};

const CourseCell: React.FC<CourseCellProps> = ({
  name,
  sectionNumber,
  duration,
  assignedColors,
  onDelete,
  isDeleteButtonVisible,
}) => {
  const cellText = `${name} G.${sectionNumber}`;
  const cellBackgroundColor = assignedColors[name];

  const handleDeleteButton = () => {
    onDelete(name);
  };

  const createDeleteCourseButton = () => {
    if (!isDeleteButtonVisible) return null; // Conditionally render based on state

    return (
      <Button
        variant="danger"
        onClick={handleDeleteButton}
        style={{ alignItems: "center" }}
      >
        <FaTrash style={{ marginRight: "5px" }} />
      </Button>
    );
  };

  return (
    <td
      rowSpan={duration}
      key={name}
      style={{
        fontSize: "14px",
        alignContent: "center",
        backgroundColor: cellBackgroundColor,
        color: "black",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        padding: "3em",
      }}
    >
      <div className="row mb-3" style={{ textAlign: "center" }}>
        <span>{cellText}</span>
      </div>
      {isDeleteButtonVisible && (
        <div className="row">{createDeleteCourseButton()}</div>
      )}
    </td>
  );
};

export default CourseCell;
