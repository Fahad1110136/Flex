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
ALTER TABLE Course_Sections
ADD CONSTRAINT CHK_available_seats CHECK (available_seats >= 0)
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
ALTER TABLE Instructors
ALTER COLUMN password VARCHAR(255) NOT NULL
GO
ALTER PROCEDURE GET_INSTRUCTOR_DETAILS
    @id CHAR(9),
    @email VARCHAR(50)  OUTPUT,
    @name VARCHAR(50)  OUTPUT,
    @password VARCHAR(255) OUTPUT,
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
INSERT INTO Instructors (id, email, password, name) VALUES
('I00001',  'instructor00001@example.com', '$2b$10$wFqT/m3U5W.tYxzvBmybeeNXB2pYscnNyuj/0zSisZgy.7wAaJiAq', 'Ahmed Raza'),    -- plain password: instructor0001
('I00002',  'instructor00002@example.com', '$2b$10$eS5rbN0ASa2ONTQuPgvyGOxYr7iMCoWJh4m0cDbUqD6Cw7zaXSWpW', 'Fatima Noor'),   -- plain password: instructor0002
('I00003',  'instructor00003@example.com', '$2b$10$2B9yfNcYGVqYY7.sXlgbguaZcby4I03iemG3S0GJ4Xc.qDkcqyddK', 'Usman Tariq'),   -- plain password: instructor0003
('I00004',  'instructor00004@example.com', '$2b$10$6p4MXo4oMPXhFVdcunGSO.PuHrH1XPsJKrMnaSwVtP.C0QqxeiGJG', 'Sana Malik'),    -- plain password: instructor0004
('I00005',  'instructor00005@example.com', '$2b$10$Z4jAcObjNzgJBsWjTbATouz6glRA.5gu5snni1MQIr4naz7EEoHXS', 'Bilal Hussain'), -- plain password: instructor0005
('I00006',  'instructor00006@example.com', '$2b$10$1.gkc9DtLMMx1301wp0Z2u9nNjD3V4l1rvBERXiM6O.4lScooDTSy', 'Ayesha Qureshi'),-- plain password: instructor0006
('I00007',  'instructor00007@example.com', '$2b$10$6SRyMCSusuo9T3Efegzkbunlw225NxOzsoiv.gjBqAQfGh0nFy0iC', 'Zubair Sheikh'), -- plain password: instructor0007
('I00008',  'instructor00008@example.com', '$2b$10$Zw4PIYQ0cAw6RLzMyBl9Ee0SfSC2JZvQJ1GuXS6Z79PLDbq9G58QG', 'Hira Baig'),    -- plain password: instructor0008
('I00009',  'instructor00009@example.com', '$2b$10$2RNRrpP50Easv190WdhlkejdEAXcX0FMEt.dV9cHAF2qNLiXinOQ6', 'Kamran Akhtar'), -- plain password: instructor0009
('I000010', 'instructor000010@example.com','$2b$10$EAG9HCbLVG3cNDZ97s/oE.zgsOg5HwYi3whZMKKa269XlqaX2/HPG', 'Nadia Siddiqui'),-- plain password: instructor00010
('I000011', 'instructor000011@example.com','$2b$10$3b8BLLIM7G/Olx5sVIAwO.Ku2/A3Ugu9vMPO8Yj6biplTItJKMKPG', 'Imran Chaudhry'),-- plain password: instructor00011
('I000012', 'instructor000012@example.com','$2b$10$pJvavfbmGgGwYtabuHgRw.NSCwiuoW.egkUOqg89quFu.G/.nE0Xm', 'Rabia Anwar'),  -- plain password: instructor00012
('I000013', 'instructor000013@example.com','$2b$10$xoD71GVU63dlhdW914nIj.0eSDoBdd1X49fHtJIgeVUtoqBj.zQWe', 'Hassan Mirza'),  -- plain password: instructor00013
('I000014', 'instructor000014@example.com','$2b$10$8vf40aYEpY65Bq8VBMw9K.tbiTg6DZYOM8neA80lZsANTDj5/QO0K', 'Sumera Javed'),  -- plain password: instructor00014
('I000015', 'instructor000015@example.com','$2b$10$G/7oApwuX.H9ZovzY0vL8Or6UBNsCFUCUkdzLI.2lHKngLznaCDYO', 'Tariq Mehmood') -- plain password: instructor00015
-- Inserting into Courses table
INSERT INTO Courses (course_code, course_name, course_dep, credit_hr, course_type, course_semester)
VALUES 
('CS101', 'Introduction to Computer Science', 'Computer Science', 3, 'Core', 1),
('CS102', 'Data Structures', 'Computer Science', 3, 'Core', 2),
('CS201', 'Database Management Systems', 'Computer Science', 3, 'Core', 3),
('CS202', 'Operating Systems', 'Computer Science', 3, 'Core', 4),
('CS301', 'Software Engineering', 'Computer Science', 3, 'Elective', 5)
INSERT INTO Courses (course_code, course_name, course_dep, credit_hr, course_type, course_semester)
VALUES 
-- Semester 1
('CS109', 'Introduction to ICT', 'Computer Science', 3, 'Core', 1),
('CS103', 'Programming Fundamentals', 'Computer Science', 3, 'Core', 1),
('MA101', 'Calculus & Analytical Geometry', 'Mathematics', 3, 'Core', 1),
('EN101', 'English Composition', 'Humanities', 3, 'Core', 1),
('PH101', 'Applied Physics', 'Science', 3, 'Core', 1),
('IS101', 'Islamic Studies', 'Humanities', 2, 'Core', 1),
-- Semester 2
('CS123', 'Object Oriented Programming', 'Computer Science', 3, 'Core', 2),
('CS104', 'Digital Logic Design', 'Computer Science', 3, 'Core', 2),
('MA102', 'Linear Algebra', 'Mathematics', 3, 'Core', 2),
('EN102', 'Communication Skills', 'Humanities', 3, 'Core', 2),
('CS106', 'Discrete Structures', 'Computer Science', 3, 'Core', 2),
('PS101', 'Pakistan Studies', 'Humanities', 2, 'Core', 2),
-- Semester 3
('CS213', 'Computer Organization & Assembly', 'Computer Science', 3, 'Core', 3),
('MA241', 'Probability & Statistics', 'Mathematics', 3, 'Core', 3),
('CS205', 'Professional Practices', 'Humanities', 3, 'Core', 3),
('CS256', 'Technical Writing', 'Humanities', 3, 'Core', 3),
('MA231', 'Multivariable Calculus', 'Mathematics', 3, 'Core', 3),
-- Semester 4
('CS206', 'Design & Analysis of Algorithms', 'Computer Science', 3, 'Core', 4),
('CS608', 'Theory of Automata', 'Computer Science', 3, 'Core', 4),
('MA702', 'Differential Equations', 'Mathematics', 3, 'Core', 4),
('CS210', 'Software Requirements Eng', 'Software Engineering', 3, 'Core', 4),
-- Semester 5
('CS300', 'Computer Networks', 'Computer Science', 3, 'Core', 5),
('CS398', 'Artificial Intelligence', 'Computer Science', 3, 'Core', 5),
('CS307', 'Compiler Construction', 'Computer Science', 3, 'Core', 5),
('CS309', 'Mobile App Development', 'Computer Science', 3, 'Elective', 5),
('CS311', 'Microprocessor Interfacing', 'Computer Science', 3, 'Elective', 5),
-- Semester 6
('CS302', 'Parallel & Distributed Computing', 'Computer Science', 3, 'Core', 6),
('CS304', 'Information Security', 'Computer Science', 3, 'Core', 6),
('CS306', 'Data Science Fundamentals', 'Computer Science', 3, 'Elective', 6),
('CS308', 'Web Engineering', 'Software Engineering', 3, 'Elective', 6),
('CS310', 'Human Computer Interaction', 'Computer Science', 3, 'Elective', 6),
('CS312', 'Numerical Computing', 'Mathematics', 3, 'Core', 6),
-- Semester 7
('CS401', 'Final Year Project - I', 'Computer Science', 3, 'Core', 7),
('CS403', 'Cloud Computing', 'Computer Science', 3, 'Elective', 7),
('CS405', 'Machine Learning', 'Computer Science', 3, 'Elective', 7),
('CS407', 'Natural Language Processing', 'Computer Science', 3, 'Elective', 7),
('CS409', 'Digital Image Processing', 'Computer Science', 3, 'Elective', 7),
('MG401', 'Entrepreneurship', 'Management', 3, 'Core', 7),
-- Semester 8
('CS402', 'Final Year Project - II', 'Computer Science', 3, 'Core', 8),
('CS404', 'Deep Learning', 'Computer Science', 3, 'Elective', 8),
('CS406', 'Internet of Things', 'Computer Science', 3, 'Elective', 8),
('CS408', 'Cyber Security Ops', 'Computer Science', 3, 'Elective', 8),
('CS410', 'Software Quality Assurance', 'Software Engineering', 3, 'Elective', 8),
('MG402', 'Organizational Behavior', 'Management', 3, 'Core', 8)
-- Inserting into Course_Sections table
INSERT INTO Course_Sections (section_id, course_code, instructor_id, available_seats)
VALUES 
('A', 'CS101', 'I12345678', 30),
('B', 'CS101', 'I98765432', 25),
('A', 'CS102', 'I12345678', 35),
('B', 'CS102', 'I98765432', 20),
('A', 'CS201', 'I12345678', 28)
INSERT INTO Course_Sections (section_id, course_code, instructor_id, available_seats)
VALUES
('C', 'CS101', 'I00001', 40),
('C', 'CS102', 'I00002', 32),
('B', 'CS201', 'I00004', 22),
('C', 'CS201', 'I000012', 30)
INSERT INTO Course_Sections (section_id, course_code, instructor_id, available_seats)
VALUES
('A', 'CS109', 'I00001', 35),
('B', 'CS109', 'I00002', 28),
('A', 'CS103', 'I00004', 30),
('B', 'CS103', 'I00005', 18),
('C', 'CS103', 'I00006', 40),
('A', 'MA101', 'I00007', 25),
('A', 'EN101', 'I000010', 20),
('B', 'EN101', 'I000011', 38),
('C', 'EN101', 'I000012', 27),
('B', 'PH101', 'I000014', 36),
('C', 'PH101', 'I000015', 24),
('A', 'IS101', 'I00001', 30),
('A', 'CS123', 'I00004', 28),
('B', 'CS123', 'I00005', 35),
('C', 'CS123', 'I00006', 17),
('A', 'CS104', 'I00007', 22),
('C', 'CS104', 'I00009', 14),
('A', 'MA102', 'I000010', 31),
('B', 'EN102', 'I000014', 33),
('C', 'CS106', 'I00003', 29),
('A', 'PS101', 'I00004', 16),
('C', 'PS101', 'I00006', 23),
('A', 'CS213', 'I00007', 32),
('B', 'MA241', 'I000011', 13),
('A', 'CS205', 'I000013', 24),
('B', 'CS256', 'I00002', 22),
('C', 'CS256', 'I00003', 38),
('A', 'MA231', 'I00004', 15),
('C', 'MA231', 'I00006', 34),
('B', 'CS206', 'I00008', 40),
('C', 'CS206', 'I00009', 18),
('A', 'CS608', 'I000010', 33),
('C', 'CS608', 'I000012', 37),
('A', 'MA702', 'I000013', 14),
('A', 'CS210', 'I00001', 23),
('C', 'CS300', 'I00006', 12),
('A', 'CS398', 'I00007', 38),
('B', 'CS398', 'I00008', 20),
('B', 'CS307', 'I000011', 30),
('C', 'CS307', 'I000012', 24),
('C', 'CS309', 'I000015', 35),
('A', 'CS311', 'I00001', 18),
('B', 'CS311', 'I00002', 32),
('A', 'CS302', 'I00004', 29),
('B', 'CS304', 'I00008', 21),
('B', 'CS306', 'I000011', 40),
('C', 'CS306', 'I000012', 17),
('A', 'CS308', 'I000013', 33),
('B', 'CS308', 'I000014', 19),
('C', 'CS308', 'I000015', 28),
('A', 'CS310', 'I00001', 14),
('B', 'CS310', 'I00002', 37),
('C', 'CS310', 'I00003', 23),
('A', 'CS312', 'I00004', 32),
('C', 'CS312', 'I00006', 11),
('A', 'CS401', 'I00007', 20),
('B', 'CS401', 'I00008', 15),
('C', 'CS401', 'I00009', 10),
('C', 'CS403', 'I000012', 22),
('A', 'CS405', 'I000013', 39),
('A', 'CS407', 'I00001', 24),
('A', 'CS409', 'I00004', 29),
('B', 'MG401', 'I00008', 23),
('C', 'MG401', 'I00009', 30),
('B', 'CS402', 'I000011', 15),
('C', 'CS402', 'I000012', 10),
('C', 'CS404', 'I000015', 21),
('A', 'CS406', 'I00001', 33),
('A', 'CS408', 'I00004', 24),
('C', 'CS410', 'I00009', 14),
('B', 'MG402', 'I000011', 22)
INSERT INTO Course_Sections (section_id, course_code, instructor_id, available_seats)
VALUES
('C', 'CS109', 'I00003', 22),
('B', 'MA101', 'I00008', 33),
('C', 'MA101', 'I00009', 15),
('A', 'PH101', 'I000013', 12),
('B', 'IS101', 'I00002', 19),
('C', 'IS101', 'I00003', 40),
('B', 'CS104', 'I00008', 40),
('B', 'MA102', 'I000011', 26),
('C', 'MA102', 'I000012', 39),
('A', 'EN102', 'I000013', 18),
('C', 'EN102', 'I000015', 25),
('A', 'CS106', 'I00001', 37),
('B', 'CS106', 'I00002', 21),
('B', 'PS101', 'I00005', 38),
('B', 'CS213', 'I00008', 20),
('C', 'CS213', 'I00009', 36),
('A', 'MA241', 'I000010', 27),
('C', 'MA241', 'I000012', 40),
('B', 'CS205', 'I000014', 35),
('C', 'CS205', 'I000015', 19),
('A', 'CS256', 'I00001', 30),
('B', 'MA231', 'I00005', 29),
('A', 'CS206', 'I00007', 26),
('B', 'CS608', 'I000011', 21),
('B', 'MA702', 'I000014', 28),
('C', 'MA702', 'I000015', 36),
('B', 'CS210', 'I00002', 39),
('C', 'CS210', 'I00003', 17),
('A', 'CS300', 'I00004', 31),
('B', 'CS300', 'I00005', 25),
('C', 'CS398', 'I00009', 34),
('A', 'CS307', 'I000010', 16),
('A', 'CS309', 'I000013', 40),
('B', 'CS309', 'I000014', 22),
('C', 'CS311', 'I00003', 27),
('B', 'CS302', 'I00005', 13),
('C', 'CS302', 'I00006', 38),
('A', 'CS304', 'I00007', 36),
('C', 'CS304', 'I00009', 30),
('A', 'CS306', 'I000010', 25),
('B', 'CS312', 'I00005', 26),
('A', 'CS403', 'I000010', 34),
('B', 'CS403', 'I000011', 28),
('B', 'CS405', 'I000014', 17),
('C', 'CS405', 'I000015', 31),
('B', 'CS407', 'I00002', 36),
('C', 'CS407', 'I00003', 13),
('B', 'CS409', 'I00005', 40),
('C', 'CS409', 'I00006', 18),
('A', 'MG401', 'I00007', 35),
('A', 'CS402', 'I000010', 12),
('A', 'CS404', 'I000013', 27),
('B', 'CS404', 'I000014', 38),
('B', 'CS406', 'I00002', 16),
('C', 'CS406', 'I00003', 29),
('B', 'CS408', 'I00005', 37),
('C', 'CS408', 'I00006', 19),
('A', 'CS410', 'I00007', 32),
('B', 'CS410', 'I00008', 26),
('A', 'MG402', 'I000010', 40),
('C', 'MG402', 'I000012', 31)
-- Inserting into TA table
INSERT INTO TA (roll_no, batch)
VALUES 
('21L-1234', 1),
('21L-6789', 2)
INSERT INTO TA (roll_no, batch)
VALUES 
('21L-0022', 1),
('21L-0234', 1),
('21L-3456', 1),
('22L-2379', 2),
('22L-3423', 2),
('22L-6790', 2),
('23L-0252', 3),
('23L-0533', 3),
('23L-1462', 3),
('24L-0098', 4),
('24L-0763', 4),
('24L-4567', 4)
-- Inserting into Course_Section_TA table
INSERT INTO Course_Section_TA (section_id, course_code, TA_roll_no)
VALUES 
('A', 'CS101', '21L-1234'),
('B', 'CS101', '21L-6789'),
('A', 'CS102', '21L-1234')
INSERT INTO Course_Section_TA (section_id, course_code, TA_roll_no)
VALUES
('C', 'CS101', '21L-1234'),
('C', 'CS102', '21L-6789'),
('A', 'CS201', '21L-0022'),
('B', 'CS201', '21L-0234'),
('C', 'CS201', '21L-3456'),
('A', 'CS109', '22L-2379'),
('B', 'CS109', '22L-3423'),
('C', 'CS109', '22L-6790'),
('A', 'CS103', '23L-0252'),
('B', 'CS103', '23L-0533'),
('C', 'CS103', '23L-1462'),
('A', 'MA101', '24L-0098'),
('B', 'MA101', '24L-0763'),
('C', 'MA101', '24L-4567'),
('A', 'EN101', '21L-1234'),
('B', 'EN101', '21L-6789'),
('C', 'EN101', '21L-0022'),
('A', 'PH101', '21L-0234'),
('B', 'PH101', '21L-3456'),
('C', 'PH101', '22L-2379'),
('A', 'IS101', '22L-3423'),
('B', 'IS101', '22L-6790'),
('C', 'IS101', '23L-0252'),
('A', 'CS123', '23L-0533'),
('B', 'CS123', '23L-1462'),
('C', 'CS123', '24L-0098'),
('A', 'CS104', '24L-0763'),
('B', 'CS104', '24L-4567'),
('C', 'CS104', '21L-1234'),
('A', 'MA102', '21L-6789'),
('B', 'MA102', '21L-0022'),
('C', 'MA102', '21L-0234'),
('A', 'EN102', '21L-3456'),
('B', 'EN102', '22L-2379'),
('C', 'EN102', '22L-3423'),
('A', 'CS106', '22L-6790'),
('B', 'CS106', '23L-0252'),
('C', 'CS106', '23L-0533'),
('A', 'PS101', '23L-1462'),
('B', 'PS101', '24L-0098'),
('C', 'PS101', '24L-0763'),
('A', 'CS213', '24L-4567'),
('B', 'CS213', '21L-1234'),
('C', 'CS213', '21L-6789'),
('A', 'MA241', '21L-0022'),
('B', 'MA241', '21L-0234'),
('C', 'MA241', '21L-3456'),
('A', 'CS205', '22L-2379'),
('B', 'CS205', '22L-3423'),
('C', 'CS205', '22L-6790'),
('A', 'CS256', '23L-0252'),
('B', 'CS256', '23L-0533'),
('C', 'CS256', '23L-1462'),
('A', 'MA231', '24L-0098'),
('B', 'MA231', '24L-0763'),
('C', 'MA231', '24L-4567'),
('A', 'CS206', '21L-1234'),
('B', 'CS206', '21L-6789'),
('C', 'CS206', '21L-0022'),
('A', 'CS608', '21L-0234'),
('B', 'CS608', '21L-3456'),
('C', 'CS608', '22L-2379'),
('A', 'MA702', '22L-3423'),
('B', 'MA702', '22L-6790'),
('C', 'MA702', '23L-0252'),
('A', 'CS210', '23L-0533'),
('B', 'CS210', '23L-1462'),
('C', 'CS210', '24L-0098'),
('A', 'CS300', '24L-0763'),
('B', 'CS300', '24L-4567'),
('C', 'CS300', '21L-1234'),
('A', 'CS398', '21L-6789'),
('B', 'CS398', '21L-0022'),
('C', 'CS398', '21L-0234'),
('A', 'CS307', '21L-3456'),
('B', 'CS307', '22L-2379'),
('C', 'CS307', '22L-3423'),
('A', 'CS309', '22L-6790'),
('B', 'CS309', '23L-0252'),
('C', 'CS309', '23L-0533'),
('A', 'CS311', '23L-1462'),
('B', 'CS311', '24L-0098'),
('C', 'CS311', '24L-0763'),
('A', 'CS302', '24L-4567'),
('B', 'CS302', '21L-1234'),
('C', 'CS302', '21L-6789'),
('A', 'CS304', '21L-0022'),
('B', 'CS304', '21L-0234'),
('C', 'CS304', '21L-3456'),
('A', 'CS306', '22L-2379'),
('B', 'CS306', '22L-3423'),
('C', 'CS306', '22L-6790'),
('A', 'CS308', '23L-0252'),
('B', 'CS308', '23L-0533'),
('C', 'CS308', '23L-1462'),
('A', 'CS310', '24L-0098'),
('B', 'CS310', '24L-0763'),
('C', 'CS310', '24L-4567'),
('A', 'CS312', '21L-1234'),
('B', 'CS312', '21L-6789'),
('C', 'CS312', '21L-0022'),
('A', 'CS401', '21L-0234'),
('B', 'CS401', '21L-3456'),
('C', 'CS401', '22L-2379'),
('A', 'CS403', '22L-3423'),
('B', 'CS403', '22L-6790'),
('C', 'CS403', '23L-0252'),
('A', 'CS405', '23L-0533'),
('B', 'CS405', '23L-1462'),
('C', 'CS405', '24L-0098'),
('A', 'CS407', '24L-0763'),
('B', 'CS407', '24L-4567'),
('C', 'CS407', '21L-1234'),
('A', 'CS409', '21L-6789'),
('B', 'CS409', '21L-0022'),
('C', 'CS409', '21L-0234'),
('A', 'MG401', '21L-3456'),
('B', 'MG401', '22L-2379'),
('C', 'MG401', '22L-3423'),
('A', 'CS402', '22L-6790'),
('B', 'CS402', '23L-0252'),
('C', 'CS402', '23L-0533'),
('A', 'CS404', '23L-1462'),
('B', 'CS404', '24L-0098'),
('C', 'CS404', '24L-0763'),
('A', 'CS406', '24L-4567'),
('B', 'CS406', '21L-1234'),
('C', 'CS406', '21L-6789'),
('A', 'CS408', '21L-0022'),
('B', 'CS408', '21L-0234'),
('C', 'CS408', '21L-3456'),
('A', 'CS410', '22L-2379'),
('B', 'CS410', '22L-3423'),
('C', 'CS410', '22L-6790'),
('A', 'MG402', '23L-0252'),
('B', 'MG402', '23L-0533'),
('C', 'MG402', '23L-1462')
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
EXEC GET_COURSES_OFFERED @rollNo = '23L-1234'
-- when you are in any other course but want to enroll in others course section  
SELECT roll_no, section_id FROM Students WHERE roll_no = '23L-0533'
SELECT * FROM Course_Sections WHERE course_code = 'EN102'
-- reset registration
DROP TABLE Registration_period
-- Transaction used
-- 1
GO
ALTER PROCEDURE GET_ENROLLED_COURSES
    @rollNo CHAR(8)
AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION       
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Students WHERE roll_no = @rollNo)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Student not found.', 16, 1)
            RETURN
        END
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
        ROLLBACK TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE()
        DECLARE @ErrSev INT = ERROR_SEVERITY()
        RAISERROR(@ErrMsg, @ErrSev, 1)
    END CATCH
END
GO
-- 2
ALTER PROCEDURE GET_CREDITHR
    @rollNo CHAR(8)
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    BEGIN TRANSACTION   
    BEGIN TRY
        DECLARE @currentSemester INT
        SELECT @currentSemester = current_semester
        FROM Students
        WHERE roll_no = @rollNo
        IF @currentSemester IS NULL
        BEGIN
            ROLLBACK TRANSACTION
            RAISERROR('Student not found.', 16, 1)
            RETURN
        END
        SELECT SUM(C.credit_hr) AS totalCredits
        FROM Enrollments E
        JOIN Courses C ON E.course_code = C.course_code
        WHERE E.roll_no = @rollNo
          AND C.course_semester = @currentSemester
        ROLLBACK TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE()
        DECLARE @ErrSev INT = ERROR_SEVERITY()
        RAISERROR(@ErrMsg, @ErrSev, 1)
    END CATCH
END
GO
-- 3
ALTER PROCEDURE CHECK_STUDENT
    @rollNo CHAR(8),
    @name VARCHAR(50)  OUTPUT,
    @email VARCHAR(50)  OUTPUT,
    @status BIT OUTPUT,
    @password VARCHAR(255) OUTPUT,
    @current_semester INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    BEGIN TRANSACTION      
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM Students WHERE roll_no = @rollNo)
        BEGIN
            SELECT
                @name = name,
                @email = email,
                @password = password,
                @current_semester = current_semester
            FROM Students
            WHERE roll_no = @rollNo
            SET @status = 1
        END
        ELSE
        BEGIN
            SET @name = NULL
            SET @email = NULL
            SET @password = NULL
            SET @current_semester = NULL
            SET @status = 0
        END
        ROLLBACK TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE()
        DECLARE @ErrSev INT = ERROR_SEVERITY()
        RAISERROR(@ErrMsg, @ErrSev, 1)
    END CATCH
END
GO