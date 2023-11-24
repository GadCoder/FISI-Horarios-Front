"use client"

import { useState, useEffect } from "react"
import { Dispatch, SetStateAction } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


type ScheduleData = {
  dia: string,
  hora_inicio: number,
  hora_fin: number

}
type Schedule = {
  codigo_seccion: string,
  numero_seccion: number,
  schedules: ScheduleData[]
}


type SectionData = {
  codigo_seccion: string,
  numero_seccion: number,
  codigo_curso: string,
  carrera: string,
  schedules: ScheduleData[]
}

type Course = {
  courseName: string,
  courseCode: string,
  major: string,
  semester: number | '',
  data: SectionData
};

type SectionListDict = {
  [key: string]: Schedule;
}
type SetCoursesType = Dispatch<SetStateAction<Course[]>>;

export default function CourseForm({ courses = [], setCourses }: { courses: Course[], setCourses: SetCoursesType }) {
  const [major, setMajor] = useState<string>('')
  const [semester, setSemester] = useState<number | ''>('')
  const [courseCode, SetCourseCode] = useState<string>('')
  const [courseName, setCourseName] = useState<string>('')
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [sectionList, setSectionList] = useState<SectionListDict>({});
  const [section, setSection] = useState<string>('')
  const [showAddedCourseModal, setShowAddedCourseModal] = useState(false);
  const [showConflictCourseModal, setShowConflictCourseModal] = useState(false)
  const [conflictedCourse, setConflictedCourse] = useState('')


  const renderSemesterOptions = () => {
    const options = [];
    const numberOfSemesters = 10;
    for (let i = 1; i <= numberOfSemesters; i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return options;
  };

  useEffect(() => {
    setCourses([])
    setCourseList([])
    setSemester('')
  }, [major])

  useEffect(() => {
    if (semester !== '') {
      const fetchData = async () => {
        try {
          const res = await fetch(`https://generador-horarios.fly.dev/cursos/get-from-ciclo/${major}/${semester}`);
          const result = await res.json();
          setCourseList(result)
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [semester]);

  const getSectionSchedule = async (sectionCode: string) => {
    try {
      const res = await fetch(`https://generador-horarios.fly.dev/horario-seccion/get-horarios-from-seccion/${major}/${sectionCode}`);
      const result = await res.json();
      return result.horarios
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };
  const getSectionLabel = (sectionData: Schedule) => {
    let label = "";
    sectionData.schedules.forEach((horario: ScheduleData) => {
      const textPart = `G.${sectionData.codigo_seccion} ${horario.dia} ${horario.hora_inicio}:00-${horario.hora_fin}:00`;
      label += textPart;
    });
    return label;
  }

  useEffect(() => {
    // Ensure that the API call is only made if a selection has been made
    if (courseCode !== '') {
      const fetchData = async () => {
        try {
          const res = await fetch(`https://generador-horarios.fly.dev/secciones/get-secciones-from-curso/${courseCode}`);
          const result = await res.json();
          const sections: SectionListDict = {}
          await Promise.all(result.map(async (section: SectionData) => {
            const sectionSchedule: Schedule = {
              numero_seccion: section.numero_seccion,
              codigo_seccion: section.codigo_seccion,
              schedules: await getSectionSchedule(section.codigo_seccion)
            }
            sections[section.codigo_seccion] = sectionSchedule;
          }))
          setSectionList(sections)
        } catch (error) {
          console.error('Error fetching data:', error);
        };

      }

      fetchData();
    }
  }, [courseCode]);


  useEffect(() => {
    if (courseList.length > 0) {
      const firstCourseOnList: Course = courseList[0]
      SetCourseCode(firstCourseOnList.courseCode);
      setCourseName(firstCourseOnList.courseName)
    }

  }, [courseList])

  useEffect(() => {
    const sectionListValues = Object.entries(sectionList)
    if (sectionListValues.length > 0) {
      const [firstKey, firstValue] = sectionListValues[0];
      setSection(firstKey)
    }

  }, [sectionList])


  const compareCourseHours = (courseSelected: Course, startTime: number, endTime: number, day: string) => {
    let conflictInHours = false

    for (let courseHour = startTime; courseHour < endTime; courseHour++) {
      courseSelected.data.schedules.forEach((selectedSchedule: ScheduleData) => {
        const selectedCourseday = selectedSchedule.dia;
        const selectedCourseStartTime = selectedSchedule.hora_inicio;
        const selectedCourseEndTime = selectedSchedule.hora_fin;
        const coursesAreOnSameDay = day === selectedCourseday
        if (coursesAreOnSameDay) {
          const courseHourInConflict = courseHour >= selectedCourseStartTime &&
            courseHour <= selectedCourseEndTime
          if (courseHourInConflict) {
            conflictInHours = true
          }
        }
      });
    }
    return conflictInHours

  }
  const checkScheduleConflicts = (courseSelected: Course, course: Course) => {
    let areScheduleConflicts = false
    course.data.schedules.forEach((schedule: ScheduleData) => {
      const day = schedule.dia;
      const startTime = schedule.hora_inicio;
      const endTime = schedule.hora_fin;
      if (compareCourseHours(courseSelected, startTime, endTime, day)) {
        areScheduleConflicts = true
        setConflictedCourse(course.courseName)
      }

    });
    return areScheduleConflicts
  }

  const isCourseAlreadyAggregated = () => {
    let courseAlreadyAggregated = false
    courses.forEach(courseInList => {
      const courseInListCode = courseInList.courseCode;
      if (courseInListCode == courseCode)
        courseAlreadyAggregated = true
    })
    return courseAlreadyAggregated
  }

  const handleAddButton = () => {
    if (section == '') {
      return;
    }
    if (isCourseAlreadyAggregated()) {
      setShowAddedCourseModal(true)
      return;
    }

    const courseData: SectionData = {
      codigo_curso: courseCode,
      numero_seccion: sectionList[section].numero_seccion,
      codigo_seccion: sectionList[section].codigo_seccion,
      carrera: major,
      schedules: sectionList[section].schedules
    }
    const courseSelected: Course = {
      courseName: courseName,
      courseCode: courseCode,
      major: major,
      semester: semester,
      data: courseData,
    };
    let areScheduleConflicts = false;
    courses.forEach((course) => {
      areScheduleConflicts = checkScheduleConflicts(courseSelected, course)
    });

    if (areScheduleConflicts) {
      setShowConflictCourseModal(true)
      return
    }
    if (!areScheduleConflicts) {
      setCourses((prevItems) => [...prevItems, courseSelected]);
    }
  };



  return (
    <Container>
      <form>
        <Row className="mb-3">
          <Col sm={12} md={3}>
            <label htmlFor="carrera" className="form-label">Carrera</label>
            <select name="carrera" id="carrera" className="form-select" value={major}
              onChange={(event) => {
                const value = event.target.value;
                setMajor(value);
              }}>
              <option value="" disabled>
                Selecciona una carrera
              </option>
              <option value="SOFTWARE">Ingeniería de Software</option>
              <option value="SISTEMAS">Ingeniería de Sistemas</option>
            </select>
          </Col>
          <Col sm={12} md={3}>
            <label htmlFor="ciclo" className="form-label">Ciclo</label>
            <select
              name="ciclo"
              id="ciclo"
              className="form-select"
              value={semester}
              onChange={(event) => {
                const value = parseInt(event.target.value, 10);
                setSemester(value);
              }}
            >
              <option value="" disabled>
                Selecciona un ciclo
              </option>
              {renderSemesterOptions()}

            </select>
          </Col>
          <Col sm={12} md={3}>
            <label htmlFor="curso" className="form-label">Curso</label>
            <select name="curso" id="curso" className="form-select"
              onChange={(event) => {
                const value = event.target.value;
                const label = event.target.options[event.target.selectedIndex].text;
                SetCourseCode(value);
                setCourseName(label);
              }}>
              <option value="" disabled >Selecciona un curso</option>
              {courseList.map((course: Course, index: number) => (
                <option key={index} value={course.courseCode}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </Col>
          <Col sm={12} md={3}>
            <label htmlFor="seccion" className="form-label">Sección</label>
            <select name="seccion" id="seccion" className="form-select"
              onChange={(event) => {
                const value = event.target.value;
                setSection(value)
              }}>
              <option value="" disabled>Selecciona una seccion</option>
              {Object.entries(sectionList)
                .sort(([, a], [, b]) => a.numero_seccion - b.numero_seccion)
                .map(([sectionKey, sectionData]) => (
                  <option key={sectionKey} value={sectionKey}>
                    {getSectionLabel(sectionData)}
                  </option>
                ))}

            </select>
          </Col>
        </Row>
      </form>

      <Row className="mb-3 mt-4 d-flex justify-content-center ">
        <Button
          variant="primary"
          onClick={handleAddButton}
          style={{ width: "30%" }}

        >
          Agregar curso
        </Button>

      </Row>

      <Modal show={showAddedCourseModal} onHide={() => setShowAddedCourseModal(false)} >
        <Modal.Header closeButton>
          <Modal.Title>Error :(</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Curso ya agregado
        </Modal.Body>
        <Modal.Footer >
          <Button variant="primary" onClick={() => setShowAddedCourseModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showConflictCourseModal} onHide={() => setShowConflictCourseModal(false)} >
        <Modal.Header closeButton>
          <Modal.Title>Error :(</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          El curso que deseas agregar presenta cruce de horarios con <b>{conflictedCourse}</b>
        </Modal.Body>
        <Modal.Footer >
          <Button variant="primary" onClick={() => setShowConflictCourseModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container >

  )
}