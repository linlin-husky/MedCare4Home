const items = {
    item1: {
        id: 'item1',
        name: 'Harry Potter Book',
        owner: 'alice',
        borrower: 'bob',
        lendDate: '2025-08-01',
        borrowDate: '2025-08-02',
        dueDate: '2025-08-15',
        expectedReturnDate: '2025-08-20',
        category: 'Book',
        description: 'A magical adventure book.'
    },
    item2: {
        id: 'item2',
        name: 'Board Game',
        owner: 'bob',
        borrower: null,
        lendDate: '2025-08-03',
        borrowDate: null,
        dueDate: null,
        expectedReturnDate: '2025-08-18',
        category: 'Game',
        description: 'Fun for family and friends.'
    },
    item3: {
        id: 'item3',
        name: 'Apple Game',
        owner: 'alice',
        borrower: null,
        lendDate: '2025-08-03',
        borrowDate: null,
        dueDate: null,
        expectedReturnDate: '2025-08-22',
        category: 'Game',
        description: 'A fruity board game.'
    },
    item4: {
        id: 'item4',
        name: 'Kitchen Knife',
        owner: 'carol',
        borrower: null,
        lendDate: '2025-08-05',
        borrowDate: null,
        dueDate: null,
        expectedReturnDate: '2025-08-25',
        category: 'Kitchenware',
        description: 'Sharp and reliable.'
    },
    item5: {
        id: 'item5',
        name: 'Toolbox',
        owner: 'dave',
        borrower: null,
        lendDate: '2025-08-06',
        borrowDate: null,
        dueDate: null,
        expectedReturnDate: '2025-08-30',
        category: 'Tool',
        description: 'Contains essential tools.'
    },
    item6: {
        id: 'item6',
        name: 'Novel Book',
        owner: 'eve',
        borrower: null,
        lendDate: '2025-08-07',
        borrowDate: null,
        dueDate: null,
        expectedReturnDate: '2025-08-28',
        category: 'Book',
        description: 'A thrilling mystery novel.'
    }
};

export default items;