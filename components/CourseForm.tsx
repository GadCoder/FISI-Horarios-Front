"use client"

import { useState, useEffect } from "react"
import { Button, Modal } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function CourseForm({ courses, setCourses }) {
  const [major, setMajor] = useState<string>('')
  const [semester, setSemester] = useState<number | ''>('')
  const [courseCode, SetCourseCode] = useState<string>('')
  const [courseName, setCourseName] = useState<string>('')
  const [courseList, setCourseList] = useState([])
  const [sectionList, setSectionList] = useState({})
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

  const getSectionSchedule = async (sectionCode, sectionNumber) => {
    try {
      const res = await fetch(`https://generador-horarios.fly.dev/horario-seccion/get-horarios-from-seccion/${major}/${sectionCode}`);
      const result = await res.json();
      return result.horarios
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };
  const getSectionLabel = (sectionData) => {
    let label = "";
    sectionData.schedules.forEach((horario) => {
      const textPart = `G.${sectionData.sectionNumber} ${horario.dia} ${horario.hora_inicio}:00-${horario.hora_fin}:00`;
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
          const sections = {}
          await Promise.all(result.map(async section => {
            const sectionSchedule = {}
            const sectionData = await getSectionSchedule(section.codigo_seccion, section.numero_seccion);
            sectionSchedule.sectionNumber = section.numero_seccion;
            sectionSchedule.schedules = sectionData
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
      const firstCourseOnList = courseList[0]
      SetCourseCode(firstCourseOnList.codigo_curso);
      setCourseName(firstCourseOnList.nombre_curso)
    }

  }, [courseList])

  useEffect(() => {
    const sectionListValues = Object.entries(sectionList)
    if (sectionListValues.length > 0) {
      const [firstKey, firstValue] = sectionListValues[0];
      setSection(firstKey)
    }

  }, [sectionList])


  const compareCourseHours = (courseSelected, startTime, endTime, day) => {
    let conflictInHours = false

    for (let courseHour = startTime; courseHour < endTime; courseHour++) {
      courseSelected.data.schedules.forEach((selectedSchedule) => {
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
  const checkScheduleConflicts = (courseSelected, course) => {
    let areScheduleConflicts = false
    course.data.schedules.forEach((schedule) => {
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

    const courseSelected = {
      courseName: courseName,
      courseCode: courseCode,
      major: major,
      semester: semester,
      data: sectionList[section],
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
              {courseList.map((course) => (
                <option key={course.id} value={course.codigo_curso}>
                  {course.nombre_curso}
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
                .sort(([, a], [, b]) => a.sectionNumber - b.sectionNumber)
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