

const baseUrl = "https://generador-horarios-quiet-dawn-4208.fly.dev"

export const getCoursesFromSemester = async (major: string, semester: number) => {
    try {

        const request = await fetch(`${baseUrl}/cursos/get-from-ciclo/${major}/${semester}`);
        const result = await request.json();
        return result
    }
    catch (error) {
        console.error('Error fetching data:', error);
        return null
    }

}

export const getSectionsFromCourse = async (courseCode: string) => {
    try {
        const request = await fetch(`${baseUrl}/secciones/get-secciones-from-curso/${courseCode}`);
        const result = await request.json();
        return result
    } catch (error) {
        console.error('Error fetching data:', error);
        return null

    }
}


export const getSchedulesFromSection = async (major: string, sectionCode: string) => {
    try {
        const res = await fetch(`${baseUrl}/horario-seccion/get-horarios-from-seccion/${major}/${sectionCode}`);
        const result = await res.json();
        return result.horarios
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}
