"use client";

import { useState, useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { Button, Modal } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";

import {
  getCoursesFromSemester,
  getSectionsFromCourse,
  getSchedulesFromSection,
} from "../../../app/api";

type ScheduleData = {
  dia: string;
  hora_inicio: number;
  hora_fin: number;
};
type Schedule = {
  codigo_seccion: string;
  numero_seccion: number;
  schedules: ScheduleData[];
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

type SectionListDict = {
  [key: string]: Schedule;
};
type SetCoursesType = Dispatch<SetStateAction<Course[] | null>>;
type setToastType = Dispatch<SetStateAction<boolean>>;

export default function CourseForm({
  addedCourses = [],
  setAddedCourses,
  setShowCourseAddedToast,
  setShowCreditsLimitToast,
  numberOfCredits,
}: {
  addedCourses: Course[] | null;
  setAddedCourses: SetCoursesType;
  setShowCourseAddedToast: setToastType;
  setShowCreditsLimitToast: setToastType;
  numberOfCredits: number;
}) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<number | "">("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [schedulesOfSelectedCourse, setSchedulesOfSelectedCourse] =
    useState<SectionData | null>(null);
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [sectionList, setSectionList] = useState<SectionListDict>({});
  const [conflictedCourse, setConflictedCourse] = useState("");

  const [showAddedCourseModal, setShowAddedCourseModal] = useState(false);
  const [showConflictCourseModal, setShowConflictCourseModal] = useState(false);
  const [courseOptionsLoading, setCourseOptionsLoading] = useState(false);
  const [sectionOptionsLoading, setSectionOptionsLoading] = useState(false);

  useEffect(() => {
    setAddedCourses(null);
    setSelectedCourse(null);
    setCourseList([]);
    setSelectedSemester("");
    setSelectedSection("");
  }, [selectedPlan]);

  useEffect(() => {
    setAddedCourses(null);
    setSelectedCourse(null);
    setCourseList([]);
    setSelectedSemester("");
    setSelectedSection("");
  }, [selectedMajor]);

  useEffect(() => {
    if (selectedSemester != "") {
      setCourseOptionsLoading(true);
      const fetchData = async () => {
        const coursesFromSemester = await getCoursesFromSemester(
          selectedPlan,
          selectedMajor,
          selectedSemester
        );
        if (coursesFromSemester != null) {
          setSelectedCourse(coursesFromSemester[0]);
          setCourseList(coursesFromSemester);
          setCourseOptionsLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedCourse == null) {
      return;
    }
    setSectionOptionsLoading(true);
    const fetchData = async () => {
      const sectionsFromCourse = await getSectionsFromCourse(
        selectedPlan,
        selectedCourse?.codigo_curso
      );
      const sections: SectionListDict = {};
      await Promise.all(
        sectionsFromCourse.map(async (section: SectionData) => {
          const sectionSchedule: Schedule = {
            numero_seccion: section.numero_seccion,
            codigo_seccion: section.codigo_seccion,
            schedules: await getSectionSchedule(section.codigo_seccion),
          };
          sections[section.codigo_seccion] = sectionSchedule;
          setSectionOptionsLoading(false);
        })
      );
      setSectionList(sections);
    };
    fetchData();
  }, [selectedCourse]);

  useEffect(() => {
    if (courseList.length > 0) {
      setSelectedCourse(null);
    }
  }, [courseList]);

  useEffect(() => {
    const sectionListValues = Object.entries(sectionList);
    if (sectionListValues.length > 0) {
      setSelectedSection("");
    }
  }, [sectionList]);

  const getInfoFromSelectedCourse = (courseCode: string) => {
    courseList.forEach((course) => {
      if (course.codigo_curso == courseCode) {
        setSelectedCourse(course);
      }
    });
  };

  const getSchedulesForSelectedCourse = (selectedSectionCode: string) => {
    if (!selectedCourse) return null;
    const schedules = sectionList[selectedSectionCode];
    const scheduleData: SectionData = {
      codigo_seccion: schedules.codigo_seccion,
      numero_seccion: schedules.numero_seccion,
      codigo_curso: selectedCourse.codigo_curso,
      carrera: selectedMajor,
      schedules: schedules.schedules,
    };
    setSchedulesOfSelectedCourse(scheduleData);
    return scheduleData;
  };

  const getSectionSchedule = async (sectionCode: string) => {
    const schedulesFromSection = await getSchedulesFromSection(
      selectedPlan,
      selectedMajor,
      sectionCode
    );
    return schedulesFromSection;
  };
  const getSectionLabel = (sectionData: Schedule) => {
    let label = "";
    sectionData.schedules.forEach((horario: ScheduleData) => {
      const textPart = `G.${sectionData.numero_seccion} ${horario.dia} ${horario.hora_inicio}:00-${horario.hora_fin}:00`;
      label += textPart;
    });
    return label;
  };

  const isCourseAlreadyAggregated = () => {
    if (addedCourses == null) return false;
    let courseAlreadyAggregated = false;
    addedCourses.forEach((courseInList) => {
      const courseInListCode = courseInList.codigo_curso;
      if (courseInListCode == selectedCourse?.codigo_curso)
        courseAlreadyAggregated = true;
    });
    return courseAlreadyAggregated;
  };

  const areConflictBetweenSchedules = (
    existingCourseSchedule: ScheduleData,
    selectedCourseSchedule: ScheduleData
  ) => {
    let conflictExists = false;
    const existingCourseDay = existingCourseSchedule.dia;
    const selectedCourseDay = selectedCourseSchedule.dia;
    if (existingCourseDay != selectedCourseDay) return false;

    const existingCourseStartTime = existingCourseSchedule.hora_inicio;
    const existingCourseEndTime = existingCourseSchedule.hora_fin;
    const selectedCourseStartTime = selectedCourseSchedule.hora_inicio;
    const selectedCourseEndTime = selectedCourseSchedule.hora_fin;
    const selectedCourseDuration =
      selectedCourseEndTime - selectedCourseStartTime;

    if (selectedCourseStartTime >= existingCourseEndTime)
      conflictExists = false;

    if (selectedCourseStartTime == existingCourseStartTime)
      conflictExists = true;

    if (
      selectedCourseStartTime >= existingCourseStartTime &&
      selectedCourseStartTime + selectedCourseDuration < existingCourseEndTime
    )
      conflictExists = true;

    return conflictExists;
  };

  const checkConflictBetweenCourses = (
    existingCourse: Course,
    selectedCourse: Course
  ) => {
    const existingCourseSchedules = existingCourse.data?.schedules;
    const selectedCourseSchedules = selectedCourse.data?.schedules;

    let conflictExists = false;
    existingCourseSchedules?.forEach((existingCourseSchedule) => {
      selectedCourseSchedules?.forEach((selectedCourseSchedule) => {
        conflictExists = areConflictBetweenSchedules(
          existingCourseSchedule,
          selectedCourseSchedule
        );
        if (conflictExists) return true;
      });
    });
    return conflictExists;
  };

  const addCourse = () => {
    if (selectedCourse) {
      setShowCourseAddedToast(true);
      setAddedCourses((prevItems) => {
        if (prevItems == null) return [selectedCourse];
        return [...prevItems, selectedCourse];
      });
    }
  };

  const handleAddButton = () => {
    if (selectedSection == "" || selectedCourse == null) {
      return;
    }

    if (isCourseAlreadyAggregated()) {
      setShowAddedCourseModal(true);
      return;
    }
    if (numberOfCredits + selectedCourse.creditaje > 26) {
      setShowCreditsLimitToast(true);
      return;
    }
    const schedulesForSelectedCourse =
      getSchedulesForSelectedCourse(selectedSection);
    selectedCourse.data = schedulesForSelectedCourse;
    if (addedCourses == null) {
      setAddedCourses([selectedCourse]);
      setShowCourseAddedToast(true);
      return;
    }
    if (schedulesForSelectedCourse == null) return;

    let canAddCourse = true;
    addedCourses.forEach((existingCourse) => {
      console.log("CHECKING CONFLICT");
      if (checkConflictBetweenCourses(existingCourse, selectedCourse)) {
        console.log("CONFLICT");
        setConflictedCourse(existingCourse.nombre_curso);
        setShowConflictCourseModal(true);
        canAddCourse = false;
      }
    });

    console.log("CONFLICT OUT");
    if (canAddCourse) addCourse();
  };

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

  const renderCourseOptions = () => {
    const options = [];
    options.push(
      <option value="" key="default-course" disabled>
        Selecciona un curso
      </option>
    );
    if (courseList.length > 0) {
      courseList.map((course: Course, index: number) =>
        options.push(
          <option key={course.nombre_curso + index} value={course.codigo_curso}>
            {course.nombre_curso}
          </option>
        )
      );
    }

    return options;
  };

  const renderSectionOptions = () => {
    const options = [];
    options.push(
      <option value="" key={"default-section"} disabled defaultChecked>
        Selecciona una sección
      </option>
    );
    {
      Object.entries(sectionList)
        .sort(([, a], [, b]) => a.numero_seccion - b.numero_seccion)
        .map(([sectionKey, sectionData]) =>
          options.push(
            <option key={sectionKey} value={sectionKey}>
              {getSectionLabel(sectionData)}
            </option>
          )
        );
    }
    return options;
  };

  return (
    <Container>
      <form>
        <Row className="mb-3">
          <Col sm={12} md={4}>
            <label htmlFor="plan-estudios" className="form-label">
              Plan de estudios
            </label>
            <select
              name="plan-estudios"
              id="plan-estudios"
              className="form-select"
              value={selectedPlan}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedPlan(value);
              }}
            >
              <option value="" disabled defaultChecked>
                Selecciona un plan de estudios
              </option>
              <option value="2018">2018</option>
              <option value="2023">2023</option>
            </select>
          </Col>

          <Col sm={12} md={5}>
            <label htmlFor="carrera" className="form-label">
              Carrera
            </label>
            <select
              name="carrera"
              id="carrera"
              className="form-select"
              value={selectedMajor}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedMajor(value);
              }}
            >
              <option value="" disabled defaultChecked>
                Selecciona una carrera
              </option>
              <option value="SOFTWARE">Ingeniería de Software</option>
              <option value="SISTEMAS" disabled={selectedPlan == "2018"}>
                Ingeniería de Sistemas
              </option>
            </select>
          </Col>
          <Col sm={12} md={3}>
            <label htmlFor="ciclo" className="form-label">
              Ciclo
            </label>
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
              <option value="" disabled defaultChecked>
                Selecciona un ciclo
              </option>
              {renderSemesterOptions()}
            </select>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={12} md={6}>
            <label htmlFor="curso" className="form-label me-3">
              Curso
            </label>
            {courseOptionsLoading ? (
              <Spinner animation="border" role="status" size="sm">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              ""
            )}
            <select
              name="curso"
              id="curso"
              className="form-select"
              value={selectedCourse?.codigo_curso || ""}
              onChange={(event) => {
                const value = event.target.value;
                getInfoFromSelectedCourse(value);
              }}
            >
              {renderCourseOptions()}
            </select>
          </Col>
          <Col sm={12} md={6}>
            <label htmlFor="seccion" className="form-label me-3">
              Sección
            </label>
            {sectionOptionsLoading ? (
              <Spinner animation="border" role="status" size="sm">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              ""
            )}
            <select
              name="seccion"
              id="seccion"
              className="form-select"
              value={selectedSection || ""}
              onChange={(event) => {
                const value = event.target.value;
                getSchedulesForSelectedCourse(value);
                setSelectedSection(value);
              }}
            >
              {renderSectionOptions()}
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
      <Modal
        show={showAddedCourseModal}
        onHide={() => setShowAddedCourseModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Upps :(</Modal.Title>
        </Modal.Header>
        <Modal.Body>Curso ya agregado</Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => setShowAddedCourseModal(false)}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showConflictCourseModal}
        onHide={() => setShowConflictCourseModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Upps :(</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          El curso que deseas agregar presenta cruce de horarios con{" "}
          <b>{conflictedCourse}</b>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => setShowConflictCourseModal(false)}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
