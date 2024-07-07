-- DROP DATABASE MicaDB;
CREATE DATABASE MicaDB;
USE MicaDB;

-- Stores the packages to be stored on Home and Account Home pages
CREATE TABLE Packages (
PID int PRIMARY KEY AUTO_INCREMENT,
PName varchar(100),
PDesc varchar(500),
PDiscount double
);

-- Stores the services to be stored on Services and Account Services pages
create table Services(
serviceID int PRIMARY KEY,
serviceName varchar(100),
serviceDesc varchar(100));

-- Stores the Customers who have been registered to the system
CREATE TABLE Customers (
customerID int PRIMARY KEY AUTO_INCREMENT,
email varchar(50) not null unique, 
firstName varchar(50), 
lastName varchar(50), 
phoneNo varchar(15), 
addressEmirate varchar(50), 
addressCity varchar(50), 
paymentMethod varchar(10), 
cardNo varchar(50), 
expiryDate varchar(50), 
CVV_ int, 
userPassword varchar(50)
);
-- Sample insert for testing 
insert into customers (email,userPassword) values('asdf@asdf.com', 'Qwerty@123');

-- Electrical, Painting and Cleaning forms
CREATE TABLE RegisteredServices(
registrationID int PRIMARY KEY AUTO_INCREMENT,
serviceDescription varchar(500),
SCost double,
customerID int, 
sid int,
pid int,
bookingDateNTime varchar(200), 
serviceDateNTime varchar(200), 
extraComments varchar(100),
payment varchar(20),
constraint package_id foreign key (PID) references Packages(PID),
constraint cust_id_fk foreign key (customerID) references Customers(customerID),
constraint services_id_fk2 foreign key (sid) references Services(serviceID)
);



-- Inserts for packages to display
insert into packages values(1,'Indoor Cleaning','Deep clean,Windows,Carpets,Kitchen,Curtains',20);
insert into packages values(2,'Outdoor Cleaning','Frontyard, Backyard,Windows,Pressure Wash',30);
insert into packages values(3,'Single Room Painting','Quality Painting,Polishing,Color Selection',30);

-- Inserts for services to display
insert into services values (1, 'Painting', 'Interior Painting Services,Exterior Painting Services, Speciality Painting Services');
insert into services values (2, 'Electrical', 'Repair and Maintenance,Updates and Enhancements,Outdoor Installation ');
insert into services values (3, 'Cleaning', 'Daily Cleaning,Weekly/ Bi-Weekly Cleaning,Special Occassion Cleaning');

-- Insert for an old registered service
insert into registeredServices (serviceDescription,SCost,customerID,sid, bookingDateNTime,serviceDateNTime,payment ) values 
('Electrical Intallation: Outlet switches installation/Repair and Extra Comment:undefined/Comments For Repairs:undefined/Updates and Enchancements:undefined/Outdoor Installations:undefined',105,1,2,'Jun 20, 2023, 6:03 PM','2023-06-25T18:03','cash');

select * from customers;
SELECT * from packages;
select * from services;
Select * from registeredservices;
