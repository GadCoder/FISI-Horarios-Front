"use client"

import { useState, useEffect } from "react"
import { Dispatch, SetStateAction } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { getCoursesFromSemester, getSectionsFromCourse, getSchedulesFromSection } from "../app/api"

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
  carrera: string,
  ciclo: number | '',
  codigo_curso: string,
  id: number,
  nombre_curso: string,
  creditaje: number,
  data: SectionData | null
};

type SectionListDict = {
  [key: string]: Schedule;
}
type SetCoursesType = Dispatch<SetStateAction<Course[]>>;

export default function CourseForm({ addedCourses = [], setAddedCourses }: { addedCourses: Course[], setAddedCourses: SetCoursesType }) {
  const [selectedMajor, setSelectedMajor] = useState<string>('')
  const [selectedSemester, setSelectedSemester] = useState<number | ''>('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [schedulesOfSelectedCourse, setSchedulesOfSelectedCourse] = useState<SectionData>()
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [selectedCourseSections, setSelectedCourseSections] = useState<SectionData | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [sectionList, setSectionList] = useState<SectionListDict>({});
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
    setAddedCourses([])
    setCourseList([])
    setSelectedSemester('')
  }, [selectedMajor])

  useEffect(() => {
    if (selectedSemester != '') {
      const fetchData = async () => {
        const coursesFromSemester = await getCoursesFromSemester(selectedMajor, selectedSemester)
        if (coursesFromSemester != null) {
          setSelectedCourse(coursesFromSemester[0])
          setCourseList(coursesFromSemester)
        }
      };

      fetchData();
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedCourse == null) {
      return
    }
    const fetchData = async () => {

      const sectionsFromCourse = await getSectionsFromCourse(selectedCourse?.codigo_curso)
      const sections: SectionListDict = {}
      await Promise.all(sectionsFromCourse.map(async (section: SectionData) => {
        const sectionSchedule: Schedule = {
          numero_seccion: section.numero_seccion,
          codigo_seccion: section.codigo_seccion,
          schedules: await getSectionSchedule(section.codigo_seccion)
        }
        sections[section.codigo_seccion] = sectionSchedule;
      }))
      setSectionList(sections)

    }
    fetchData();
  }, [selectedCourse]);

  useEffect(() => {
    if (courseList.length > 0) {
      const firstCourseOnList: Course = courseList[0]
      setSelectedCourse(firstCourseOnList)
    }

  }, [courseList])

  useEffect(() => {
    const sectionListValues = Object.entries(sectionList)
    if (sectionListValues.length > 0) {
      const [firstKey, firstValue] = sectionListValues[0];
      setSelectedSection(firstKey)
      getSchedulesForSelectedCourse(firstKey)
    }

  }, [sectionList])

  const getInfoFromSelectedCourse = (courseCode: string) => {
    courseList.forEach(course => {
      if (course.codigo_curso == courseCode) {
        setSelectedCourse(course)
      }
    })
  }

  const getSchedulesForSelectedCourse = (selectedSectionCode: string) => {
    if (!selectedCourse)
      return null
    const schedules = sectionList[selectedSectionCode]
    const scheduleData: SectionData = {
      codigo_seccion: schedules.codigo_seccion,
      numero_seccion: schedules.numero_seccion,
      codigo_curso: selectedCourse.codigo_curso,
      carrera: selectedMajor,
      schedules: schedules.schedules
    }
    setSchedulesOfSelectedCourse(scheduleData)
    return scheduleData
  }

  const getSectionSchedule = async (sectionCode: string) => {
    const schedulesFromSection = await getSchedulesFromSection(selectedMajor, sectionCode)
    return schedulesFromSection

  };
  const getSectionLabel = (sectionData: Schedule) => {
    let label = "";
    sectionData.schedules.forEach((horario: ScheduleData) => {
      const textPart = `G.${sectionData.numero_seccion} ${horario.dia} ${horario.hora_inicio}:00-${horario.hora_fin}:00`;
      label += textPart;
    });
    return label;
  }


  const compareCourseHours = (startTime: number, endTime: number, day: string) => {
    let conflictInHours = false
    if (!selectedCourseSections)
      return false

    for (let courseHour = startTime; courseHour < endTime; courseHour++) {
      selectedCourseSections.schedules.forEach((selectedSchedule: ScheduleData) => {
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

  const checkScheduleConflicts = (courseToAdd: Course) => {
    let areScheduleConflicts = false
    if (selectedCourseSections == null)
      return false
    selectedCourseSections.schedules.forEach((schedule: ScheduleData) => {
      const day = schedule.dia;
      const startTime = schedule.hora_inicio;
      const endTime = schedule.hora_fin;
      if (compareCourseHours(startTime, endTime, day)) {
        areScheduleConflicts = true
        setConflictedCourse(courseToAdd.nombre_curso)
      }

    });
    return areScheduleConflicts
  }

  const isCourseAlreadyAggregated = () => {
    let courseAlreadyAggregated = false
    addedCourses.forEach(courseInList => {
      const courseInListCode = courseInList.codigo_curso;
      if (courseInListCode == selectedCourse?.codigo_curso)
        courseAlreadyAggregated = true
    })
    return courseAlreadyAggregated
  }

  const handleAddButton = () => {
    if (selectedSection == '') {
      return;
    }
    if (isCourseAlreadyAggregated()) {
      setShowAddedCourseModal(true)
      return;
    }

    let areScheduleConflicts = false;
    addedCourses.forEach((course) => {
      areScheduleConflicts = checkScheduleConflicts(course)
    });

    if (areScheduleConflicts) {
      setShowConflictCourseModal(true)
      return
    }
    if (!areScheduleConflicts) {
      if (selectedCourse && selectedSection) {
        selectedCourse.data = getSchedulesForSelectedCourse(selectedSection)
        console.log("Adding course: ")
        console.log(selectedCourse)
        setAddedCourses((prevItems) => [...prevItems, selectedCourse]);
      }
    }
  };



  return (
    <Container>
      <form>
        <Row className="mb-3">
          <Col sm={12} md={3}>
            <label htmlFor="carrera" className="form-label">Carrera</label>
            <select name="carrera" id="carrera" className="form-select" value={selectedMajor}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedMajor(value);
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
              value={selectedSemester}
              onChange={(event) => {
                const value = parseInt(event.target.value, 10);
                setSelectedSemester(value);
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
                getInfoFromSelectedCourse(value)
              }}>
              <option value="" disabled >Selecciona un curso</option>
              {courseList && Array.isArray(courseList) && (
                courseList.map((course: Course, index: number) => (
                  <option key={index} value={course.codigo_curso}>
                    {course.nombre_curso}
                  </option>
                ))
              )}
            </select>
          </Col>
          <Col sm={12} md={3}>
            <label htmlFor="seccion" className="form-label">Sección</label>
            <select name="seccion" id="seccion" className="form-select"
              onChange={(event) => {
                const value = event.target.value;
                getSchedulesForSelectedCourse(value)
                setSelectedSection(value)
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