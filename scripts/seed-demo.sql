-- ARTHA Demo Seed Script
-- Populates demo data for testuser@example.com with budgets and transactions
-- Covers Warning (>=80% and <100%), Exceeded (>=100%), Ok (<80%), and None status

SET @UserId = (SELECT Id FROM Users WHERE Email = 'testuser@example.com' LIMIT 1);
SET @Month = '2026-10-01';

-- Clear existing demo transactions and budgets for 2026-10 for this user
DELETE FROM Transactions WHERE UserId = @UserId AND Date >= '2026-10-01' AND Date <= '2026-10-31';
DELETE FROM Budgets WHERE UserId = @UserId AND Month = @Month;

-- Retrieve Category IDs
SET @CatFood = (SELECT Id FROM Categories WHERE UserId = @UserId AND Name = 'Food' LIMIT 1);
SET @CatTransport = (SELECT Id FROM Categories WHERE UserId = @UserId AND Name = 'Transport' LIMIT 1);
SET @CatRent = (SELECT Id FROM Categories WHERE UserId = @UserId AND Name = 'Rent' LIMIT 1);
SET @CatUtilities = (SELECT Id FROM Categories WHERE UserId = @UserId AND Name = 'Utilities' LIMIT 1);
SET @CatEntertainment = (SELECT Id FROM Categories WHERE UserId = @UserId AND Name = 'Entertainment' LIMIT 1);
SET @CatSalary = (SELECT Id FROM Categories WHERE UserId = @UserId AND Name = 'Salary' LIMIT 1);

-- 1. Insert Budgets for 2026-10
INSERT INTO Budgets (UserId, CategoryId, Month, LimitAmount) VALUES
(@UserId, @CatFood, @Month, 10000.00),         -- Food Limit: 10,000
(@UserId, @CatEntertainment, @Month, 3000.00), -- Entertainment Limit: 3,000
(@UserId, @CatTransport, @Month, 5000.00),     -- Transport Limit: 5,000
(@UserId, @CatRent, @Month, 20000.00);         -- Rent Limit: 20,000

-- 2. Insert Income Transactions
INSERT INTO Transactions (UserId, CategoryId, Amount, Type, Date, Note) VALUES
(@UserId, @CatSalary, 65000.00, 'Income', '2026-10-01', 'Monthly Professional Salary');

-- 3. Insert Expense Transactions
INSERT INTO Transactions (UserId, CategoryId, Amount, Type, Date, Note) VALUES
-- Food: Total = 8,500 (85.0% of 10,000 -> WARNING)
(@UserId, @CatFood, 4500.00, 'Expense', '2026-10-05', 'Monthly Grocery at Shwapno'),
(@UserId, @CatFood, 4000.00, 'Expense', '2026-10-12', 'Fresh Produce & Pantry Supplies'),

-- Entertainment: Total = 3,600 (120.0% of 3,000 -> EXCEEDED)
(@UserId, @CatEntertainment, 1800.00, 'Expense', '2026-10-08', 'Cineplex Movie Tickets & Snacks'),
(@UserId, @CatEntertainment, 1800.00, 'Expense', '2026-10-14', 'Weekend Concert with Friends'),

-- Rent: Total = 20,000 (100.0% of 20,000 -> EXCEEDED)
(@UserId, @CatRent, 20000.00, 'Expense', '2026-10-02', 'Apartment Rent October'),

-- Transport: Total = 2,200 (44.0% of 5,000 -> OK)
(@UserId, @CatTransport, 1200.00, 'Expense', '2026-10-03', 'Ride sharing & Commute passes'),
(@UserId, @CatTransport, 1000.00, 'Expense', '2026-10-10', 'Fuel refill'),

-- Utilities: Total = 1,800 (No budget limit -> NONE)
(@UserId, @CatUtilities, 1800.00, 'Expense', '2026-10-07', 'Electricity & Internet Bills');
