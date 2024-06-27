import { useState, useEffect, useRef } from "react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "react-bootstrap";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

type ScheduleData = {
  dia: string;
  hora_inicio: number;
  hora_fin: number;
};

type SectionData = {
  codigo_seccion: string;
  numero_seccion: number;
  codigo_curso: string;
  carrera: string;
  schedules: ScheduleData[];
};

type Course = {
  carrera: string;
  ciclo: number | "";
  codigo_curso: string;
  id: number;
  nombre_curso: string;
  creditaje: number;
  data: SectionData | null;
};

type AssignedColor = {
  [key: string]: string;
};

type ScheduleCourseList = {
  [key: string]: ScheduleCourse[];
};
type ScheduleCourse = {
  name: string;
  sectionNumber: number;
  startTime: number;
  duration: number;
};

type SetCoursesType = Dispatch<SetStateAction<Course[] | null>>;

const days: string[] = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

const initialscheduleCourses = () => {
  const initialScheduleCourse: ScheduleCourseList = {};
  days.forEach((day) => {
    initialScheduleCourse[day] = [];
  });
  return initialScheduleCourse;
};

export default function ScheduleTable({
  addedCourses = [],
  setAddedCourses,
  numberOfCredits,
  pageTheme,
}: {
  addedCourses: Course[] | null;
  setAddedCourses: SetCoursesType;
  numberOfCredits: number;
  pageTheme: string;
}) {
  const baseColors = [
    "#fbf8cc",
    "#fde4cf",
    "#ffcfd2",
    "#f1c0e8",
    "#cfbaf0",
    "#a3c4f3",
    "#90dbf4",
    "#8eecf5",
    "#98f5e1",
    "#b9fbc0",
  ];

  const [availableColors, setAvailableColors] = useState(baseColors);
  const [areCoursesAdded, setAreCoursesAdded] = useState(false);
  const [assignedColors, setAssignedColors] = useState<AssignedColor>({});
  const [forceUpdateFlag, setForceUpdateFlag] = useState(false);
  const hours = Array.from({ length: 14 }, (_, index) => index + 8);
  const [scheduleCourses, setScheduleCourses] = useState<ScheduleCourseList>(
    initialscheduleCourses
  );
  const tableRef = useRef(null);

  const getAvailableColor = () => {
    let color = availableColors[0];
    if (availableColors.length == 1) {
      setAvailableColors(baseColors);
      return color;
    }
    setAvailableColors(availableColors.slice(1));
    return color;
  };

  const assignColorToCourse = (courseName: string, courseColor: string) => {
    const newAssignedColors = assignedColors;
    newAssignedColors[courseName] = courseColor;
    setAssignedColors(newAssignedColors);
  };

  useEffect(() => {
    if (addedCourses == null) {
      setAvailableColors(baseColors);
      setAreCoursesAdded(true);
      setForceUpdateFlag(prevFlag => !prevFlag); // Toggle the flag to force a re-render
      setScheduleCourses(initialscheduleCourses)
      return;
    }

    setAreCoursesAdded(true);
    addedCourses.forEach((course) => {
      const courseName = course.nombre_curso;
      if (courseName in assignedColors) {
        return;
      }
      const courseColor = getAvailableColor();
      assignColorToCourse(courseName, courseColor);
      if (course && course.data) {
        const sectionNumber = course.data.numero_seccion;
        course.data.schedules.forEach((schedule) => {
          const day = schedule.dia;
          const startTime = schedule.hora_inicio;
          const endTime = schedule.hora_fin;
          const duration = endTime - startTime;

          scheduleCourses[day].push({
            name: courseName,
            sectionNumber: sectionNumber,
            startTime: startTime,
            duration: duration,
          });
        });
      }
    });
  }, [addedCourses]);

  const deleteCourseFromAssignedColors = (courseName: string) => {
    const assignedColor = assignedColors[courseName];
    const updatedAssignedColors = Object.fromEntries(
      Object.entries(assignedColors).filter(([key]) => key !== courseName)
    );
    setAssignedColors(updatedAssignedColors);
    setAvailableColors([...availableColors, assignedColor]);
  };

  const handleDeleteButton = (courseName: string) => {
    deleteCourseFromAssignedColors(courseName);
    const updatedCourses: Course[] = [];
    const updatedScheduleCourses: ScheduleCourseList = {};
    days.forEach((day) => {
      updatedScheduleCourses[day] = [];
      scheduleCourses[day].forEach((course) => {
        if (course.name != courseName) {
          updatedScheduleCourses[day].push(course);
        }
      });
    });
    if (addedCourses) {
      addedCourses.forEach((course) => {
        if (course.nombre_curso != courseName) {
          updatedCourses.push(course);
        }
      });
      setAddedCourses(updatedCourses);
      setScheduleCourses(updatedScheduleCourses);
    }
  };
  const createDeleteCourseButton = (courseName: string) => {
    return (
      <Button variant="danger" onClick={() => handleDeleteButton(courseName)}>
        Eliminar curso
      </Button>
    );
  };
  const createCourseCell = (
    name: string,
    sectionNumber: number,
    duration: number
  ) => {
    const cellText = `${name} G.${sectionNumber}`;
    const cellBackgroundColor = assignedColors[name];
    return (
      <td
        rowSpan={duration}
        key={name}
        style={{
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
        <div className="row ">{createDeleteCourseButton(name)}</div>
      </td>
    );
  };
  const createEmptyCell = (key: string) => {
    return (
      <td
        key={key}
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      ></td>
    );
  };

  const createHourCell = (hour: number) => {
    return (
      <td className="text-center" key={`${hour}-${hour + 1}`}>{`${hour}:00-${hour + 1
        }:00`}</td>
    );
  };

  const createEmptyCellsTable = (hour: number) => {
    const hourCells = [];
    for (let i = 0; i < 6; i++) {
      const day = days[i];
      const emptyCell = createEmptyCell(hour + day);
      hourCells.push(emptyCell);
    }
    return hourCells;
  };

  const createCellsTable = (hour: number) => {
    const hourCells = [];
    for (let i = 0; i < 6; i++) {
      const day = days[i];
      let courseAssigned = false;
      let skipCell = false;
      scheduleCourses[day].map((course) => {
        if (course.startTime == hour) {
          const courseCell = createCourseCell(
            course.name,
            course.sectionNumber,
            course.duration
          );
          hourCells.push(courseCell);
          courseAssigned = true;
        } else {
          for (let j = hour; j >= hour - 5; j--) {
            if (
              course.startTime == j &&
              !courseAssigned &&
              hour < course.startTime + course.duration
            ) {
              skipCell = true;
            }
          }
        }
      });
      if (!courseAssigned) {
        const emptyCell = createEmptyCell(hour + day);
        if (!skipCell) hourCells.push(emptyCell);
      }
    }
    return hourCells.map((cell) => {
      return cell;
    });
  };

  return (
    <Container className="mt-3">
      <Row>
        <h2 style={{ textAlign: "center" }}>HORARIOS</h2>
      </Row>
      <Row className="m-3">
        <h2>Creditaje: {numberOfCredits}</h2>
      </Row>
      <Row>
      <div style={{ overflowX: "auto", maxWidth: "100%", marginTop: "20px" }} id="table-container">
        <table className="table table-bordered" ref={tableRef} style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th className="text-center">HORA</th>
                {days.map((dia, index) => (
                  <th key={index} className="text-center">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour, hourIndex) => (
                <tr key={hourIndex + "-" + hour}>
                  {createHourCell(hour)}
                  {addedCourses == null
                    ? createEmptyCellsTable(hour)
                    : createCellsTable(hour)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Row>
    </Container>
  );
}
