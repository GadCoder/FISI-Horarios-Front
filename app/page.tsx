"use client";
import { useState, useEffect } from "react";
import CourseForm from "@/web/components/CourseForm";
import ScheduleTable from "@/web/components/ScheduleTable";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import ThemeToggle from "@/web/components/ThemeToggle";
import { Col } from "react-bootstrap";

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

export default function Home() {
  const [addedCourses, setAddedCourses] = useState<Course[] | null>(null);
  const [numberOfCredits, setNumberOfCredits] = useState(0);
  const [showCourseAddedToast, setShowCourseAddedToast] = useState(false);
  const [showCreditsLimitToast, setShowCreditsLimitToast] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    let credits = 0;
    addedCourses?.forEach((course) => {
      credits += course.creditaje;
    });
    setNumberOfCredits(credits);
    console.log("Added courses: ", addedCourses);
  }, [addedCourses]);

  return (
    <Container>
      <Row className="mt-3 justify-content-between align-items-center">
        <Col sm={8}>
          <h1 style={{ fontWeight: "bold" }}>FISI - Generador de horarios</h1>
        </Col>
        <Col sm={4} className="d-flex justify-content-end">
          <ThemeToggle initialValue={theme} setPageTheme={setTheme} />
        </Col>
      </Row>
      <Row>
        <CourseForm
          addedCourses={addedCourses}
          setAddedCourses={setAddedCourses}
          numberOfCredits={numberOfCredits}
          setShowCourseAddedToast={setShowCourseAddedToast}
          setShowCreditsLimitToast={setShowCreditsLimitToast}
        />
      </Row>
      <Row>
        <ScheduleTable
          addedCourses={addedCourses}
          setAddedCourses={setAddedCourses}
          numberOfCredits={numberOfCredits}
          pageTheme={theme}
        />
      </Row>

      <ToastContainer
        className="p-3"
        position={"top-end"}
        style={{ zIndex: 1 }}
      >
        <Toast
          show={showCourseAddedToast}
          delay={3000}
          bg={"success"}
          autohide
          onClose={() => setShowCourseAddedToast(false)}
        >
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">Felicidades 🤠</strong>
          </Toast.Header>
          <Toast.Body>Curso agregado con éxito</Toast.Body>
        </Toast>
        <Toast
          show={showCreditsLimitToast}
          delay={3000}
          bg={"danger"}
          autohide
          onClose={() => setShowCreditsLimitToast(false)}
        >
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">Upps 🙁</strong>
          </Toast.Header>
          <Toast.Body>Límite de créditos permitidos alcanzados</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
