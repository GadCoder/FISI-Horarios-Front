

const baseUrl = "https://fisi-horarios-api.onrender.com"

export const getCoursesFromSemester = async (plan: string, major: string, semester: number) => {
    try {

        const request = await fetch(`${baseUrl}/cursos/get-from-ciclo/${plan}/${major}/${semester}`);
        const result = await request.json();
        return result
    }
    catch (error) {
        console.error('Error fetching data:', error);
        return null
    }

}

export const getSectionsFromCourse = async (plan: string, courseCode: string) => {
    try {
        const request = await fetch(`${baseUrl}/secciones/get-secciones-from-curso/${plan}/${courseCode}`);
        const result = await request.json();
        return result
    } catch (error) {
        console.error('Error fetching data:', error);
        return null

    }
}


export const getSchedulesFromSection = async (plan: string, major: string, sectionCode: string) => {
    try {
        const res = await fetch(`${baseUrl}/horario-seccion/get-horarios-from-seccion/${plan}/${major}/${sectionCode}`);
        const result = await res.json();
        return result.horarios
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}
