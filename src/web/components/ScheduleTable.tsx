import { useState, useEffect, useRef } from "react";
import { Dispatch, SetStateAction } from "react";
import { Button, Col } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import CourseCell from "./CourseCell";
import html2canvas from "html2canvas";

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
  const [areDeleteButtonsVisible, setAreDeleteButtonsVisible] = useState(true);
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
      setForceUpdateFlag((prevFlag) => !prevFlag);
      setScheduleCourses(initialscheduleCourses);
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

  const exportSchedule = () => {
    setAreDeleteButtonsVisible(false);
  };

  useEffect(() => {
    if (!areDeleteButtonsVisible) {
      const table = document.getElementById("schedule-table") as HTMLElement;
      html2canvas(table).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "table.png";
        link.click();
      });
      setAreDeleteButtonsVisible(true);
    }
  }, [areDeleteButtonsVisible]);

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
      <td className="text-center" key={`${hour}-${hour + 1}`}>
        {`${hour}:00-${hour + 1}:00`}
      </td>
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
          const courseCell = (
            <CourseCell
              name={course.name}
              sectionNumber={course.sectionNumber}
              duration={course.duration}
              assignedColors={assignedColors}
              onDelete={handleDeleteButton}
              isDeleteButtonVisible={areDeleteButtonsVisible}
            />
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
    <Container className="mt-4">
      <Row className="d-flex justify-content-between">
        <Col md={6}>
          <h2>Creditaje: {numberOfCredits}</h2>
        </Col>
        <Col md={6} className="d-flex justify-content-end">
          <Button variant="success" onClick={exportSchedule}>
            Exportar horario
          </Button>
        </Col>
      </Row>
      <Row>
        <div
          style={{ overflowX: "auto", maxWidth: "100%", marginTop: "20px" }}
          id="table-container"
        >
          <table
            className="table table-bordered"
            id="schedule-table"
            ref={tableRef}
            style={{ tableLayout: "fixed" }}
          >
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
