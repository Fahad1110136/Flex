CREATE DATABASE Flex
GO 
USE Flex
CREATE TABLE Sections
(
    section_id CHAR(1) PRIMARY KEY
)
CREATE TABLE Students
(
    roll_no CHAR(8) PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(50) NOT NULL,
    current_semester INT CHECK (current_semester >= 1 AND current_semester <= 8) NOT NULL DEFAULT 1,
    section_id CHAR(1) NOT NULL,
    FOREIGN KEY (section_id) REFERENCES Sections(section_id)
)
CREATE TABLE Instructors
(
    id CHAR(9) PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(50) NOT NULL
)
CREATE TABLE Courses 
(
    course_code VARCHAR(9) PRIMARY KEY,
    course_name VARCHAR(50) UNIQUE NOT NULL,
    course_dep VARCHAR(50) NOT NULL,
    credit_hr INT CHECK (credit_hr >= 1 AND credit_hr <= 3) NOT NULL,
    course_type VARCHAR(10) CHECK (course_type IN ('Elective', 'Core')) NOT NULL,
    course_semester INT CHECK(course_semester >= 1 AND course_semester <= 8) NOT NULL
)
CREATE TABLE Course_Sections
(
    section_id CHAR(1),
    course_code VARCHAR(9),
    instructor_id CHAR(9),
    available_seats INT CHECK (available_seats > 0) NOT NULL,
    PRIMARY KEY (section_id, course_code),
    FOREIGN KEY (section_id) REFERENCES Sections(section_id),
    FOREIGN KEY (course_code) REFERENCES Courses(course_code),
    FOREIGN KEY (instructor_id) REFERENCES Instructors(id)
)
CREATE TABLE TA 
(
    roll_no CHAR(8) PRIMARY KEY,
    batch INT NOT NULL,
    FOREIGN KEY (roll_no) REFERENCES Students(roll_no) 
)
CREATE TABLE Enrollments
(
    enroll_id INT IDENTITY(1,1) PRIMARY KEY,
    roll_no CHAR(8), 
    course_code VARCHAR(9),
    enroll_datetime DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (roll_no) REFERENCES Students(roll_no),
    FOREIGN KEY (course_code) REFERENCES Courses(course_code)
)
CREATE TABLE Course_Section_TA
(
    section_id CHAR(1),
    course_code VARCHAR(9),
    TA_roll_no CHAR(8), 
    PRIMARY KEY (section_id, course_code, TA_roll_no),
    FOREIGN KEY (section_id, course_code) REFERENCES Course_Sections(section_id, course_code),
    FOREIGN KEY (TA_roll_no) REFERENCES TA(roll_no)
)
CREATE TABLE Registration_Period
(
    period_id CHAR(9) PRIMARY KEY,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    is_active BIT DEFAULT 0
)
CREATE TABLE Admin
(
    admin_id CHAR(9) PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(50) NOT NULL
)
GO

CREATE PROCEDURE REGISTER_STUDENT
    @rollNo CHAR(8),  
    @email VARCHAR(50),                   
    @password VARCHAR(100),
    @name VARCHAR(50)
AS
BEGIN
    DECLARE @section_id CHAR(1)
    SET @section_id = CHAR(65 + ABS(CHECKSUM(NEWID())) % 3)
    INSERT INTO Students (name, roll_no, email, password, section_id) 
    VALUES (@name, @rollNo, @email, @password, @section_id)
END
GO

CREATE PROCEDURE UPDATE_PASSWORD
    @rollNo CHAR(8), 
    @password VARCHAR(100)
AS
BEGIN
    UPDATE Students SET password = @password 
    WHERE roll_no = @rollNo
END
GO

CREATE PROCEDURE GET_ENROLLED_COURSES
    @rollNo CHAR(8)
AS
BEGIN
    SELECT 
        E.course_code, 
        C.course_name, 
        C.course_dep, 
        C.credit_hr, 
        C.course_type,
        C.course_semester AS semester
    FROM Enrollments E
    JOIN Courses C ON E.course_code = C.course_code
    WHERE E.roll_no = @rollNo
END
GO

CREATE PROCEDURE GET_COURSES_OFFERED
    @rollNo CHAR(8)
AS
BEGIN
    DECLARE @studentSemester INT
    DECLARE @studentSection CHAR(1)
    SELECT 
        @studentSemester = current_semester,
        @studentSection = section_id
    FROM Students
    WHERE roll_no = @rollNo
    SELECT 
        c.course_code, 
        c.course_name, 
        c.course_dep, 
        c.credit_hr, 
        c.course_type, 
        c.course_semester,
        cs.available_seats
    FROM Courses c
    JOIN Course_Sections cs 
        ON c.course_code = cs.course_code
    JOIN Registration_Period rp 
        ON GETDATE() BETWEEN rp.start_datetime AND rp.end_datetime AND rp.is_active = 1
    WHERE 
        c.course_semester = @studentSemester
        AND cs.section_id = @studentSection
    ORDER BY c.course_name
END
GO
ALTER PROCEDURE GET_COURSES_OFFERED
    @rollNo CHAR(8)
AS
BEGIN
    DECLARE @studentSemester INT
    SELECT @studentSemester = current_semester
    FROM Students
    WHERE roll_no = @rollNo
    SELECT 
        c.course_code, 
        c.course_name, 
        c.course_dep, 
        c.credit_hr, 
        c.course_type, 
        c.course_semester,
        cs.available_seats
    FROM Courses c
    JOIN Course_Sections cs 
        ON c.course_code = cs.course_code
    WHERE 
        c.course_semester = @studentSemester + 1
        AND c.course_code NOT IN (
            SELECT course_code 
            FROM Enrollments 
            WHERE roll_no = @rollNo
        )
        AND cs.available_seats > 0
    ORDER BY c.course_name
END
GO
ALTER PROCEDURE GET_COURSES_OFFERED
    @rollNo CHAR(8)
AS
BEGIN
    DECLARE @studentSemester INT
    SELECT @studentSemester = current_semester
    FROM Students
    WHERE roll_no = @rollNo

    SELECT 
        c.course_code, 
        c.course_name, 
        c.course_dep, 
        c.credit_hr, 
        c.course_type, 
        c.course_semester,
        cs.available_seats,
        cs.section_id
    FROM Courses c
    JOIN Course_Sections cs 
        ON c.course_code = cs.course_code
    WHERE 
        c.course_semester = @studentSemester + 1
        AND c.course_code NOT IN (
            SELECT course_code 
            FROM Enrollments 
            WHERE roll_no = @rollNo
        )
        AND cs.available_seats > 0
    ORDER BY c.course_name
END
GO

CREATE PROCEDURE ENROLL_STUDENT
    @rollNo CHAR(8),
    @courseCode VARCHAR(9)
AS
BEGIN
    DECLARE @sectionId CHAR(1)
    DECLARE @availableSeats INT
    DECLARE @newCourseCreditHours INT
    DECLARE @currentTotalCreditHours INT
    SELECT @sectionId = section_id
    FROM Students
    WHERE roll_no = @rollNo
    IF @sectionId IS NULL
    BEGIN
        RAISERROR('Student section not found.', 16, 1)
        RETURN
    END
    SELECT @availableSeats = available_seats
    FROM Course_Sections
    WHERE section_id = @sectionId AND course_code = @courseCode
    IF @availableSeats IS NULL OR @availableSeats <= 0
    BEGIN
        RAISERROR('No available seats in this section.', 16, 1)
        RETURN
    END
    SELECT @newCourseCreditHours = credit_hr
    FROM Courses
    WHERE course_code = @courseCode
    IF @newCourseCreditHours IS NULL
    BEGIN
        RAISERROR('Course not found.', 16, 1)
        RETURN
    END
    SELECT @currentTotalCreditHours = ISNULL(SUM(C.credit_hr), 0)
    FROM Enrollments E
    JOIN Courses C ON E.course_code = C.course_code
    WHERE E.roll_no = @rollNo
    IF @currentTotalCreditHours + @newCourseCreditHours > 18
    BEGIN
        RAISERROR('Credit hour limit exceeded. Cannot enroll in this course.', 16, 1)
        RETURN
    END
    IF EXISTS (
        SELECT 1 
        FROM Enrollments 
        WHERE roll_no = @rollNo AND course_code = @courseCode
    )
    BEGIN
        RAISERROR('Student is already enrolled in this course.', 16, 1)
        RETURN
    END
    INSERT INTO Enrollments (roll_no, course_code)
    VALUES (@rollNo, @courseCode)
    UPDATE Course_Sections
    SET available_seats = available_seats - 1
    WHERE section_id = @sectionId AND course_code = @courseCode
END
GO

CREATE PROCEDURE CHECK_STUDENT
    @rollNo CHAR(8),
    @name VARCHAR(50) OUTPUT,
    @email VARCHAR(50) OUTPUT,
    @status BIT OUTPUT,
    @password VARCHAR(255) OUTPUT,
    @current_semester INT OUTPUT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Students WHERE roll_no = @rollNo)
    BEGIN
        SELECT 
            @name = name, 
            @email = email, 
            @password = password,
            @current_semester = current_semester
        FROM Students 
        WHERE roll_no = @rollNo;
        SET @status = 1;
    END
    ELSE
    BEGIN
        SET @name = NULL;
        SET @email = NULL;
        SET @password = NULL;
        SET @current_semester = NULL;
        SET @status = 0;
    END
END
SELECT * FROM Registration_Period 
WHERE GETDATE() BETWEEN start_datetime AND end_datetime 
AND is_active = 1
GO

CREATE PROCEDURE GET_CREDITHR
    @rollNo CHAR(8)
AS
BEGIN
    DECLARE @currentSemester INT
    SELECT @currentSemester = current_semester
    FROM Students
    WHERE roll_no = @rollNo
    SELECT SUM(C.credit_hr) AS totalCredits 
    FROM Enrollments E
    JOIN Courses C ON E.course_code = C.course_code
    WHERE E.roll_no = @rollNo
    AND C.course_semester = @currentSemester
END
GO

CREATE PROCEDURE INCREMENT_SEM
AS
BEGIN
    UPDATE Students
    SET current_semester = current_semester + 1
    WHERE current_semester < 8
END
GO

CREATE PROCEDURE START_REGISTRATION
AS
BEGIN
    DECLARE @period_id CHAR(9)
    SET @period_id = FORMAT(GETDATE(), 'yyyyMMdd') + RIGHT('0' + CAST(DATEPART(HOUR, GETDATE()) AS VARCHAR), 2)

    INSERT INTO Registration_Period (period_id, start_datetime, end_datetime, is_active)
    VALUES (
        @period_id,
        GETDATE(),
        DATEADD(DAY, 10, GETDATE()),
        1
    )
END
GO

CREATE PROCEDURE STOP_REGISTRATION
AS
BEGIN
    UPDATE Registration_Period
    SET is_active = 0
    WHERE is_active = 1
END
GO

CREATE PROCEDURE GET_REGISTERED_STUDENTS
    @instructorId CHAR(9),
    @courseCode VARCHAR(9),
    @sectionId CHAR(1)
AS 
BEGIN
    SELECT DISTINCT
        cs.instructor_id, 
        s.roll_no, 
        s.name, 
        cs.course_code, 
        s.section_id
    FROM Course_Sections cs 
    JOIN Enrollments e ON cs.course_code = e.course_code
    JOIN Students s ON e.roll_no = s.roll_no
    WHERE cs.instructor_id = @instructorId 
      AND cs.course_code = @courseCode
      AND s.section_id = @sectionId
END
GO

CREATE PROCEDURE GET_TEACHER_ASSISTANTS
    @instructorId CHAR(9),
    @courseCode VARCHAR(9),
    @sectionId CHAR(9)
AS
BEGIN
    SELECT DISTINCT
        ta.roll_no AS ta_roll_no, 
        s.name AS ta_name, 
        cs.course_code, 
        cs.section_id
    FROM Students s 
    JOIN TA ta ON s.roll_no = ta.roll_no
    JOIN Course_Section_TA cst 
        ON ta.roll_no = cst.TA_roll_no 
        AND cst.course_code = @courseCode
        AND cst.section_id = @sectionId 
    JOIN Course_Sections cs 
        ON cs.section_id = cst.section_id 
        AND cs.course_code = cst.course_code
    WHERE cs.course_code = @courseCode
      AND cs.section_id = @sectionId
END
GO 

CREATE PROCEDURE GET_COURSES_TEACHING
    @instructorId CHAR(9)
AS
BEGIN
    SELECT DISTINCT cs.course_code, c.course_name, cs.section_id
    FROM Course_Sections cs
    JOIN Courses c ON cs.course_code = c.course_code
    WHERE cs.instructor_id = @instructorId
END
GO

CREATE PROCEDURE GET_INSTRUCTOR_DETAILS
    @id CHAR(9),
    @email VARCHAR(50) OUTPUT,
    @name VARCHAR(50) OUTPUT,
    @password VARCHAR(50) OUTPUT,
    @status BIT OUTPUT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Instructors WHERE id = @id)
    BEGIN
        SELECT 
            @email = email, 
            @name = name,
            @password = password
        FROM Instructors
        WHERE id = @id

        SET @status = 1
    END
    ELSE
    BEGIN
        SET @email = NULL
        SET @name = NULL
        SET @password = NULL
        SET @status = 0
    END
END
GO

CREATE PROCEDURE UPDATE_INSTRUCTOR
    @id CHAR(9),
    @name VARCHAR(50)
AS
BEGIN
    UPDATE Instructors 
    SET name = @name 
    WHERE id = @id
END
GO

CREATE PROCEDURE ADD_COURSE
    @courseCode VARCHAR(9),
    @courseName VARCHAR(50),
    @courseDep VARCHAR(50),
    @creditHr INT,
    @courseType VARCHAR(10),
    @courseSemester INT
AS
BEGIN
    INSERT INTO Courses (course_code, course_name, course_dep, credit_hr, course_type, course_semester) 
    VALUES (@courseCode, @courseName, @courseDep, @creditHr, @courseType, @courseSemester)
END
GO

CREATE PROCEDURE UPDATE_STUDENTS
    @rollNo CHAR(8),
    @name VARCHAR(50)
AS
BEGIN
    UPDATE Students 
    SET name = @name 
    WHERE roll_no = @rollNo
END
GO

CREATE PROCEDURE DROP_ENROLLMENT
    @rollNo CHAR(8),
    @courseCode VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @sectionId CHAR(1)
    SELECT @sectionId = section_id
    FROM Students
    WHERE roll_no = @rollNo
    IF NOT EXISTS (
        SELECT 1 
        FROM Enrollments 
        WHERE roll_no = @rollNo AND course_code = @courseCode
    )
    BEGIN
        RAISERROR('Student is not enrolled in the specified course.', 16, 1)
        RETURN
    END
    DELETE FROM Enrollments
    WHERE roll_no = @rollNo AND course_code = @courseCode
    UPDATE Course_Sections
    SET available_seats = available_seats + 1
    WHERE section_id = @sectionId AND course_code = @courseCode
END

INSERT INTO Sections (section_id) VALUES ('A'), ('B'), ('C')
EXEC REGISTER_STUDENT 
    @rollNo = '21L-1234', 
    @email = 'ali@example.com', 
    @password = '$2a$10$69YoD0MtUJZjaZehdsIsruVqhq7TOsBtPFlX./4YZRiUwNgcXuEny', 
    @name = 'Ali Khan'
EXEC REGISTER_STUDENT 
    @rollNo = '21L-6789', 
    @email = 'sara@example.com', 
    @password = '$2a$10$69YoD0MtUJZjaZehdsIsruVqhq7TOsBtPFlX./4YZRiUwNgcXuEny', 
    @name = 'Sara Ahmed'
EXEC REGISTER_STUDENT 
    @rollNo = '21L-0432', 
    @email = 'umar@example.com', 
    @password = '$2a$10$69YoD0MtUJZjaZehdsIsruVqhq7TOsBtPFlX./4YZRiUwNgcXuEny', 
    @name = 'Umar Saeed'
EXEC REGISTER_STUDENT 
    @rollNo = '23L-0545', 
    @email = 'l230545@lhr.nu.edu.pk', 
    @password = '$2a$10$69YoD0MtUJZjaZehdsIsruVqhq7TOsBtPFlX./4YZRiUwNgcXuEny', 
    @name = 'Mujtaba'
-- Inserting into Instructors table
INSERT INTO Instructors (id, email, password, name) 
VALUES 
('I12345678', 'instructor1@example.com', '$2a$10$6lh9qJ2t5cJlYmAPgqIF5zYpvRIvlVRtQEX8Dbs7Mt9pmtD8jXxuS', 'John Doe'),
('I98765432', 'instructor2@example.com', '$2a$10$6lh9qJ2t5cJlYmAPgqIF5zYpvRIvlVRtQEX8Dbs7Mt9pmtD8jXxuS', 'Jane Smith')
-- Inserting into Courses table
INSERT INTO Courses (course_code, course_name, course_dep, credit_hr, course_type, course_semester)
VALUES 
('CS101', 'Introduction to Computer Science', 'Computer Science', 3, 'Core', 1),
('CS102', 'Data Structures', 'Computer Science', 3, 'Core', 2),
('CS201', 'Database Management Systems', 'Computer Science', 3, 'Core', 3),
('CS202', 'Operating Systems', 'Computer Science', 3, 'Core', 4),
('CS301', 'Software Engineering', 'Computer Science', 3, 'Elective', 5)
-- Inserting into Course_Sections table
INSERT INTO Course_Sections (section_id, course_code, instructor_id, available_seats)
VALUES 
('A', 'CS101', 'I12345678', 30),
('B', 'CS101', 'I98765432', 25),
('A', 'CS102', 'I12345678', 35),
('B', 'CS102', 'I98765432', 20),
('A', 'CS201', 'I12345678', 28)
-- Inserting into TA table
INSERT INTO TA (roll_no, batch)
VALUES 
('21L-1234', 1),
('21L-6789', 2)
-- Inserting into Course_Section_TA table
INSERT INTO Course_Section_TA (section_id, course_code, TA_roll_no)
VALUES 
('A', 'CS101', '21L-1234'),
('B', 'CS101', '21L-6789'),
('A', 'CS102', '21L-1234')
-- Inserting into Registration_Period table
INSERT INTO Registration_Period (period_id, start_datetime, end_datetime, is_active)
VALUES 
('RP202501', '2025-01-01 00:00:00', '2025-11-30 23:59:59', 1)
-- Inserting into Admin table
INSERT INTO Admin (admin_id, password, name)
VALUES 
('A00000001', '$2b$10$7qE9m0icA2dELmQ2fEg2dOtpIRd/xV5i401OpYn8kOG2E58taf8xK', 'Flex Admin')
-- Example of Enrollments data
INSERT INTO Enrollments (roll_no, course_code)
VALUES 
('21L-1234', 'CS101'),
('21L-6789', 'CS102'),
('21L-0432', 'CS101')
-- Example of Increments in semester (if needed)
EXEC INCREMENT_SEM
-- Test procedure directly
EXEC GET_COURSES_OFFERED @rollNo = '23L-1234';