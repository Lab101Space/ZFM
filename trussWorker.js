function getConnectedMembersFromString(TrussString) {
    // Parsing the string to get an array of node and member strings
    const Truss = TrussString.match(/node\([^)]+\)|member\([^)]+\)/g);

    // Extracting node numbers and initializing an object to store connections
    const nodeConnections = {};
    Truss.forEach(item => {
        const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
        if (predicate === 'node') {
            const nodeNumber = args[0];
            nodeConnections[nodeNumber] = [];
        }
    });

    // Identifying members connected to each node
    Truss.forEach(item => {
        const [predicate, memberNumber, node1, node2] = item.split(/[(),\s]+/).filter(Boolean);
        if (predicate === 'member') {
            if (nodeConnections[node1]) {
                nodeConnections[node1].push(parseInt(memberNumber));
            }
            if (nodeConnections[node2]) {
                nodeConnections[node2].push(parseInt(memberNumber));
            }
        }
    });

    // Converting the connections object into an array of arrays
    const connectionsArray = Object.values(nodeConnections).map(connections => 
        connections.sort((a, b) => a - b)
    );

    return connectionsArray;
}

function countMembersPerNode(TrussString) {
    // Utilizing the previously defined getConnectedMembersFromString function
    const connectedMembers = getConnectedMembersFromString(TrussString);

    // Mapping each sub-array to its length
    return connectedMembers.map(nodeMembers => nodeMembers.length);
}

// Reusing the getConnectedMembersFromString function
function getConnectedMembersFromString(TrussString) {
    // Parsing the string to get an array of node and member strings
    const Truss = TrussString.match(/node\([^)]+\)|member\([^)]+\)/g);

    // Extracting node numbers and initializing an object to store connections
    const nodeConnections = {};
    Truss.forEach(item => {
        const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
        if (predicate === 'node') {
            const nodeNumber = args[0];
            nodeConnections[nodeNumber] = [];
        }
    });

    // Identifying members connected to each node
    Truss.forEach(item => {
        const [predicate, memberNumber, node1, node2] = item.split(/[(),\s]+/).filter(Boolean);
        if (predicate === 'member') {
            if (nodeConnections[node1]) {
                nodeConnections[node1].push(parseInt(memberNumber));
            }
            if (nodeConnections[node2]) {
                nodeConnections[node2].push(parseInt(memberNumber));
            }
        }
    });

    // Converting the connections object into an array of arrays
    const connectionsArray = Object.values(nodeConnections).map(connections => 
        connections.sort((a, b) => a - b)
    );

    return connectionsArray;
}

function getNodesWithMConnections(TrussString, M) {
    // Utilizing the getConnectedMembersFromString function
    const connectedMembers = getConnectedMembersFromString(TrussString);

    // Finding nodes with exactly M members connected
    const nodesWithMConnections = [];
    Object.keys(connectedMembers).forEach(node => {
        if (connectedMembers[node].length === M) {
            nodesWithMConnections.push(parseInt(node));
        }
    });

    return nodesWithMConnections;
}

// Reusing the getConnectedMembersFromString function
function getConnectedMembersFromString(TrussString) {
    // Parsing the string to get an array of node and member strings
    const Truss = TrussString.match(/node\([^)]+\)|member\([^)]+\)/g);

    // Extracting node numbers and initializing an object to store connections
    const nodeConnections = {};
    Truss.forEach(item => {
        const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
        if (predicate === 'node') {
            const nodeNumber = args[0];
            nodeConnections[nodeNumber] = [];
        }
    });

    // Identifying members connected to each node
    Truss.forEach(item => {
        const [predicate, memberNumber, node1, node2] = item.split(/[(),\s]+/).filter(Boolean);
        if (predicate === 'member') {
            if (nodeConnections[node1]) {
                nodeConnections[node1].push(parseInt(memberNumber));
            }
            if (nodeConnections[node2]) {
                nodeConnections[node2].push(parseInt(memberNumber));
            }
        }
    });

    return nodeConnections;
}

function free(TrussString) {
    // Parsing the string to get an array of predicates
    const predicates = TrussString.match(/\w+\([^)]+\)/g);

    // Initializing sets to store nodes, supports, and loads
    const nodes = new Set();
    const supportsAndLoads = new Set();

    // Processing each predicate
    predicates.forEach(item => {
        const [predicate, firstArg, secondArg] = item.split(/[(),\s]+/).filter(Boolean);

        if (predicate === 'node') {
            // For 'node', the node number is the first argument
            nodes.add(parseInt(firstArg));
        } else if (predicate === 'support') {
            // For 'support', the node number is the second argument
            supportsAndLoads.add(parseInt(secondArg));
        } else if (predicate === 'load') {
            // For 'load', the node number is the first argument
            supportsAndLoads.add(parseInt(firstArg));
        }
    });

    // Filtering nodes to find those that have no support and no load
    const freeNodes = [...nodes].filter(node => !supportsAndLoads.has(node));

    return freeNodes.sort((a, b) => a - b); // Sort the result for consistent order
}

function collinear(TrussString, member1, member2) {
    // Function to calculate the slope between two points
    function calculateSlope(x1, y1, x2, y2) {
        if (x2 - x1 === 0) return Infinity; // Handle vertical lines
        return (y2 - y1) / (x2 - x1);
    }

    // Parsing the string to get an array of predicates
    const predicates = TrussString.match(/\w+\([^)]+\)/g);

    // Storing node coordinates and member endpoints
    const nodeCoordinates = {};
    const memberEndpoints = {};

    predicates.forEach(item => {
        const [predicate, arg1, arg2, arg3] = item.split(/[(),\s]+/).filter(Boolean);
        switch (predicate) {
            case 'node':
                nodeCoordinates[arg1] = { x: parseFloat(arg2), y: parseFloat(arg3) };
                break;
            case 'member':
                memberEndpoints[arg1] = { node1: arg2, node2: arg3 };
                break;
        }
    });

    // Converting member numbers to strings for key access
    const member1Key = member1.toString();
    const member2Key = member2.toString();

    // Check if member numbers are in memberEndpoints
    if (!memberEndpoints[member1Key] || !memberEndpoints[member2Key]) return false;

    // Getting the coordinates of the ends of each member
    const member1Coordinates = memberEndpoints[member1Key];
    const member2Coordinates = memberEndpoints[member2Key];

    // Calculating the slope for each member
    const slope1 = calculateSlope(
        nodeCoordinates[member1Coordinates.node1].x, 
        nodeCoordinates[member1Coordinates.node1].y, 
        nodeCoordinates[member1Coordinates.node2].x, 
        nodeCoordinates[member1Coordinates.node2].y
    );
    const slope2 = calculateSlope(
        nodeCoordinates[member2Coordinates.node1].x, 
        nodeCoordinates[member2Coordinates.node1].y, 
        nodeCoordinates[member2Coordinates.node2].x, 
        nodeCoordinates[member2Coordinates.node2].y
    );

    // Comparing the slopes to determine collinearity
    return slope1 === slope2;
}

function rule1(TrussString) {
    const connectedMembers = getConnectedMembersFromString(TrussString);
    const freeNodes = free(TrussString);

    for (let node in connectedMembers) {
        const nodeNumber = parseInt(node);
        // Check if the node is free of loads and supports
        if (freeNodes.includes(nodeNumber)) {
            // Check if exactly two members are attached to the node
            if (connectedMembers[node].length === 2) {
                // Check if the two members are collinear
                if (!collinear(TrussString, connectedMembers[node][0], connectedMembers[node][1])) {
                    // Create simplified TrussString without the node and its two connected members
                    const simplifiedTrussString = TrussString
                        .replace(new RegExp(`node\\(${nodeNumber},[^)]+\\)`, 'g'), '')
                        .replace(new RegExp(`member\\(${connectedMembers[node][0]},[^)]+\\)`, 'g'), '')
                        .replace(new RegExp(`member\\(${connectedMembers[node][1]},[^)]+\\)`, 'g'), '')
                        .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                        .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                        .replace(/^,|,$/g, '') // Remove leading and trailing commas
                        .trim();

                    return [true, nodeNumber, connectedMembers[node], `[${simplifiedTrussString}]`];
                }
            }
        }
    }

    return [false];
}

function rule2(TrussString) {
    const connectedMembers = getConnectedMembersFromString(TrussString);
    const freeNodes = free(TrussString);

    for (let node in connectedMembers) {
        const nodeNumber = parseInt(node);

        // Check if the node is free of loads and supports
        if (freeNodes.includes(nodeNumber)) {
            const members = connectedMembers[node];

            // Check if exactly three members are attached to the node
            if (members.length === 3) {
                // Check all combinations of two members for collinearity
                for (let i = 0; i < members.length; i++) {
                    for (let j = i + 1; j < members.length; j++) {
                        if (collinear(TrussString, members[i], members[j])) {
                            // Find the third non-collinear member
                            const thirdMember = members.find(member => member !== members[i] && member !== members[j]);

                            // Create simplified TrussString without the non-collinear member
                            const simplifiedTrussString = TrussString
                                .replace(new RegExp(`member\\(${thirdMember},[^)]+\\)`, 'g'), '')
                                .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                                .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                                .replace(/^,|,$/g, '') // Remove leading and trailing commas
                                .trim();

                            return [true, nodeNumber, [thirdMember], `[${simplifiedTrussString}]`];
                        }
                    }
                }
            }
        }
    }

    return [false];
}

function rule3(TrussString) {
    const connectedMembers = getConnectedMembersFromString(TrussString);
    const freeNodes = free(TrussString);

    for (let node in connectedMembers) {
        const nodeNumber = parseInt(node);

        // Check if the node is free of loads and supports
        if (freeNodes.includes(nodeNumber)) {
            // Check if exactly one member is attached to the node
            if (connectedMembers[node].length === 1) {
                const memberNumber = connectedMembers[node][0];

                // Create simplified TrussString without the node and its single connected member
                const simplifiedTrussString = TrussString
                    .replace(new RegExp(`node\\(${nodeNumber},[^)]+\\)`, 'g'), '')
                    .replace(new RegExp(`member\\(${memberNumber},[^)]+\\)`, 'g'), '')
                    .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                    .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                    .replace(/^,|,$/g, '') // Remove leading and trailing commas
                    .trim();

                return [true, nodeNumber, [memberNumber], `[${simplifiedTrussString}]`];
            }
        }
    }

    return [false];
}

    function rule4(TrussString) {
        // Parsing the string to get an array of predicates
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
    
        // Storing the supports and member endpoints
        const supports = new Set();
        const memberEndpoints = {};
    
        predicates.forEach(item => {
            const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
            switch (predicate) {
                case 'support':
                    if (args[0] === 'pin') {
                        supports.add(args[1]);
                    }
                    break;
                case 'member':
                    memberEndpoints[args[0]] = { node1: args[1], node2: args[2] };
                    break;
            }
        });
    
        // Check each member for pin supports at both ends
        for (let member in memberEndpoints) {
            const { node1, node2 } = memberEndpoints[member];
            if (supports.has(node1) && supports.has(node2)) {
                // Create simplified TrussString without the member
                const simplifiedTrussString = TrussString
                    .replace(new RegExp(`member\\(${member},[^)]+\\)`, 'g'), '')
                    .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                    .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                    .replace(/^,|,$/g, '') // Remove leading and trailing commas
                    .trim();
    
                return [true, parseInt(member), [parseInt(member)], `[${simplifiedTrussString}]`];
            }
        }
    
        return [false];
    }
    
    function isHorizontal(TrussString, memberNumber) {
        // Parse the TrussString to extract node and member information
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
        const nodeCoordinates = {};
        const memberEndpoints = {};
    
        predicates.forEach(item => {
            const [predicate, arg1, arg2, arg3] = item.split(/[(),\s]+/).filter(Boolean);
            switch (predicate) {
                case 'node':
                    nodeCoordinates[arg1] = { x: parseFloat(arg2), y: parseFloat(arg3) };
                    break;
                case 'member':
                    memberEndpoints[arg1] = { node1: arg2, node2: arg3 };
                    break;
            }
        });
    
        // Retrieve the member's end nodes
        const member = memberEndpoints[memberNumber.toString()];
        if (!member) return false; // Return false if member is not found
    
        // Compare the y-coordinates of the end nodes
        const node1 = nodeCoordinates[member.node1];
        const node2 = nodeCoordinates[member.node2];
    
        return node1 && node2 && node1.y === node2.y;
    }


    function isVertical(TrussString, memberNumber) {
        // Parse the TrussString to extract node and member information
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
        const nodeCoordinates = {};
        const memberEndpoints = {};
    
        predicates.forEach(item => {
            const [predicate, arg1, arg2, arg3] = item.split(/[(),\s]+/).filter(Boolean);
            switch (predicate) {
                case 'node':
                    nodeCoordinates[arg1] = { x: parseFloat(arg2), y: parseFloat(arg3) };
                    break;
                case 'member':
                    memberEndpoints[arg1] = { node1: arg2, node2: arg3 };
                    break;
            }
        });
    
        // Retrieve the member's end nodes
        const member = memberEndpoints[memberNumber.toString()];
        if (!member) return false; // Return false if member is not found
    
        // Compare the x-coordinates of the end nodes
        const node1 = nodeCoordinates[member.node1];
        const node2 = nodeCoordinates[member.node2];
    
        return node1 && node2 && node1.x === node2.x;
    }

    function rule5(TrussString, nodeNumber) {
        const connectedMembers = getConnectedMembersFromString(TrussString);
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
    
        // Check if only one member is connected to the node
        if (connectedMembers[nodeNumber] && connectedMembers[nodeNumber].length === 1) {
            const memberNumber = connectedMembers[nodeNumber][0];
    
            let hasRollerXSupport = false;
            let hasLoadX = false;
    
            predicates.forEach(item => {
                const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
                if (predicate === 'support' && args[0] === 'rollerx' && args[1] === nodeNumber.toString()) {
                    hasRollerXSupport = true;
                }
                if (predicate === 'load' && args[0] === nodeNumber.toString() && args[1] === 'x') {
                    hasLoadX = true;
                }
            });
    
            // Check if the member is horizontal and the node has 'rollerx' support and a load in 'x' direction
            if (isHorizontal(TrussString, memberNumber) && hasRollerXSupport && hasLoadX) {
                // Create simplified TrussString without the node and its single connected member
                const simplifiedTrussString = TrussString
                    .replace(new RegExp(`node\\(${nodeNumber},[^)]+\\)`, 'g'), '')
                    .replace(new RegExp(`member\\(${memberNumber},[^)]+\\)`, 'g'), '')
                    .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                    .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                    .replace(/^,|,$/g, '') // Remove leading and trailing commas
                    .trim();
    
                return [true, nodeNumber, [memberNumber], `[${simplifiedTrussString}]`];
            }
        }
    
        return [false];
    }

    function rule6(TrussString) {
        const connectedMembers = getConnectedMembersFromString(TrussString);
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
    
        for (let node in connectedMembers) {
            const nodeNumber = parseInt(node);
    
            // Check if only one member is connected to the node
            if (connectedMembers[nodeNumber].length === 1) {
                const memberNumber = connectedMembers[nodeNumber][0];
    
                let hasRollerXSupport = false;
                let hasNoLoad = true;
    
                predicates.forEach(item => {
                    const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
                    if (predicate === 'support' && args[0] === 'rollerx' && args[1] === nodeNumber.toString()) {
                        hasRollerXSupport = true;
                    }
                    if (predicate === 'load' && args[0] === nodeNumber.toString()) {
                        hasNoLoad = false;
                    }
                });
    
                // Check if the member is vertical, and the node has 'rollerx' support and no load
                if (! isVertical(TrussString, memberNumber) && hasRollerXSupport && hasNoLoad) {
                    // Create simplified TrussString without the node and its single connected member
                    const simplifiedTrussString = TrussString
                        .replace(new RegExp(`node\\(${nodeNumber},[^)]+\\)`, 'g'), '')
                        .replace(new RegExp(`member\\(${memberNumber},[^)]+\\)`, 'g'), '')
                        .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                        .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                        .replace(/^,|,$/g, '') // Remove leading and trailing commas
                        .trim();
    
                    return [true, nodeNumber, [memberNumber], `[${simplifiedTrussString}]`];
                }
            }
        }
    
        return [false];
    }
    
    function rule7(TrussString) {
        const connectedMembers = getConnectedMembersFromString(TrussString);
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
    
        for (let node in connectedMembers) {
            const nodeNumber = parseInt(node);
    
            // Check if only one member is connected to the node
            if (connectedMembers[nodeNumber].length === 1) {
                const memberNumber = connectedMembers[nodeNumber][0];
    
                let hasRollerYSupport = false;
                let hasNoLoadY = true;
    
                predicates.forEach(item => {
                    const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
                    if (predicate === 'support' && args[0] === 'rollery' && args[1] === nodeNumber.toString()) {
                        hasRollerYSupport = true;
                    }
                    if (predicate === 'load' && args[0] === nodeNumber.toString() && args[1] === 'y') {
                        hasNoLoadY = false;
                    }
                });
    
                // Check if the member is vertical, and the node has 'rollery' support and no load in 'y' direction
                if (isVertical(TrussString, memberNumber) && hasRollerYSupport && hasNoLoadY) {
                    // Create simplified TrussString without the node and its single connected member
                    const simplifiedTrussString = TrussString
                        .replace(new RegExp(`member\\(${memberNumber},[^)]+\\)`, 'g'), '')
                        .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                        .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                        .replace(/^,|,$/g, '') // Remove leading and trailing commas
                        .trim();
    
                    return [true, nodeNumber, [memberNumber], `[${simplifiedTrussString}]`];
                }
            }
        }
    
        return [false];
    }
 
    function rule8(TrussString) {
        const connectedMembers = getConnectedMembersFromString(TrussString);
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
    
        for (let node in connectedMembers) {
            const nodeNumber = parseInt(node);
    
            // Check if only one member is connected to the node
            if (connectedMembers[nodeNumber].length === 1) {
                const memberNumber = connectedMembers[nodeNumber][0];
    
                let hasRollerYSupport = false;
                let hasNoLoad = true;
    
                predicates.forEach(item => {
                    const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
                    if (predicate === 'support' && args[0] === 'rollery' && args[1] === nodeNumber.toString()) {
                        hasRollerYSupport = true;
                    }
                    if (predicate === 'load' && args[0] === nodeNumber.toString()) {
                        hasNoLoad = false;
                    }
                });
    
                // Check if the member is not horizontal, and the node has 'rollery' support and no load
                if (!isHorizontal(TrussString, memberNumber) && hasRollerYSupport && hasNoLoad) {
                    // Create simplified TrussString without the node and its single connected member
                    const simplifiedTrussString = TrussString
                     //   .replace(new RegExp(`node\\(${nodeNumber},[^)]+\\)`, 'g'), '')
                        .replace(new RegExp(`member\\(${memberNumber},[^)]+\\)`, 'g'), '')
                        .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                        .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                        .replace(/^,|,$/g, '') // Remove leading and trailing commas
                        .trim();
    
                    return [true, nodeNumber, [memberNumber], `[${simplifiedTrussString}]`];
                }
            }
        }
    
        return [false];
    }

    function rule9(TrussString) {
        const connectedMembers = getConnectedMembersFromString(TrussString);
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
    
        for (let node in connectedMembers) {
            const nodeNumber = parseInt(node);
    
            // Check if exactly two members are connected to the node
            if (connectedMembers[nodeNumber].length === 2) {
                const [member1, member2] = connectedMembers[nodeNumber];
    
                let hasRollerXSupport = false;
                let hasNoLoadX = true;
    
                predicates.forEach(item => {
                    const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
                    if (predicate === 'support' && args[0] === 'rollerx' && args[1] === nodeNumber.toString()) {
                        hasRollerXSupport = true;
                    }
                    if (predicate === 'load' && args[0] === nodeNumber.toString() && args[1] === 'x') {
                        hasNoLoadX = false;
                    }
                });
    
                // Check if one member is horizontal and the other is vertical
                if (isHorizontal(TrussString, member1) !== isHorizontal(TrussString, member2) &&
                    isVertical(TrussString, member1) !== isVertical(TrussString, member2) &&
                    hasRollerXSupport && hasNoLoadX) {
    
                    const horizontalMember = isHorizontal(TrussString, member1) ? member1 : member2;
    
                    // Create simplified TrussString without the node and the horizontal member
                    const simplifiedTrussString = TrussString
                 //       .replace(new RegExp(`node\\(${nodeNumber},[^)]+\\)`, 'g'), '')
                        .replace(new RegExp(`member\\(${horizontalMember},[^)]+\\)`, 'g'), '')
                        .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                        .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                        .replace(/^,|,$/g, '') // Remove leading and trailing commas
                        .trim();
    
                    return [true, nodeNumber, [horizontalMember], `[${simplifiedTrussString}]`];
                }
            }
        }
    
        return [false];
    }
    
    function rule10(TrussString) {
        const connectedMembers = getConnectedMembersFromString(TrussString);
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
    
        for (let node in connectedMembers) {
            const nodeNumber = parseInt(node);
    
            // Check if exactly two members are connected to the node
            if (connectedMembers[nodeNumber].length === 2) {
                const [member1, member2] = connectedMembers[nodeNumber];
    
                let hasRollerYSupport = false;
                let hasNoLoadY = true;
    
                predicates.forEach(item => {
                    const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
                    if (predicate === 'support' && args[0] === 'rollery' && args[1] === nodeNumber.toString()) {
                        hasRollerYSupport = true;
                    }
                    if (predicate === 'load' && args[0] === nodeNumber.toString() && args[1] === 'y') {
                        hasNoLoadY = false;
                    }
                });
    
                // Check if one member is horizontal and the other is vertical
                if (isHorizontal(TrussString, member1) !== isHorizontal(TrussString, member2) &&
                    isVertical(TrussString, member1) !== isVertical(TrussString, member2) &&
                    hasRollerYSupport && hasNoLoadY) {
    
                    const verticalMember = isVertical(TrussString, member1) ? member1 : member2;
    
                    // Create simplified TrussString without the node and the vertical member
                    const simplifiedTrussString = TrussString
                    //    .replace(new RegExp(`node\\(${nodeNumber},[^)]+\\)`, 'g'), '')
                        .replace(new RegExp(`member\\(${verticalMember},[^)]+\\)`, 'g'), '')
                        .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                        .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                        .replace(/^,|,$/g, '') // Remove leading and trailing commas
                        .trim();
    
                    return [true, nodeNumber, [verticalMember], `[${simplifiedTrussString}]`];
                }
            }
        }
    
        return [false];
    }
    
    function rule11(TrussString) {
        const connectedMembers = getConnectedMembersFromString(TrussString);
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
    
        for (let node in connectedMembers) {
            const nodeNumber = parseInt(node);
    
            // Check if exactly two members are connected to the node
            if (connectedMembers[nodeNumber].length === 2) {
                const [member1, member2] = connectedMembers[nodeNumber];
    
                let hasNoSupport = true;
                let hasLoadX = false;
                let hasNoLoadY = true;
    
                predicates.forEach(item => {
                    const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
                    if (predicate === 'support' && args[1] === nodeNumber.toString()) {
                        hasNoSupport = false;
                    }
                    if (predicate === 'load' && args[0] === nodeNumber.toString()) {
                        if (args[1] === 'x') {
                            hasLoadX = true;
                        }
                        if (args[1] === 'y') {
                            hasNoLoadY = false;
                        }
                    }
                });
    
                // Check if one member is horizontal and the other is not, and the node has no support, a load in 'x' direction, and no load in 'y'
                if (isHorizontal(TrussString, member1) !== isHorizontal(TrussString, member2) &&
                    hasNoSupport && hasLoadX && hasNoLoadY) {
                        
                    const nonHorizontalMember = isHorizontal(TrussString, member1) ? member2 : member1;

                    // Create simplified TrussString without the node and the non-horizontal member
                    const simplifiedTrussString = TrussString
                //        .replace(new RegExp(`node\\(${nodeNumber},[^)]+\\)`, 'g'), '')
                        .replace(new RegExp(`member\\(${nonHorizontalMember},[^)]+\\)`, 'g'), '')
                        .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                        .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                        .replace(/^,|,$/g, '') // Remove leading and trailing commas
                        .trim();
    
                    return [true, nodeNumber, [nonHorizontalMember], `[${simplifiedTrussString}]`];
                }
            }
        }
    
        return [false];
    }
    
    function rule12(TrussString) {
        const connectedMembers = getConnectedMembersFromString(TrussString);
        const predicates = TrussString.match(/\w+\([^)]+\)/g);
    
        for (let node in connectedMembers) {
            const nodeNumber = parseInt(node);
    
            // Check if exactly two members are connected to the node
            if (connectedMembers[nodeNumber].length === 2) {
                const [member1, member2] = connectedMembers[nodeNumber];
    
                let hasNoSupport = true;
                let hasNoLoadX = true;
                let hasLoadY = false;
    
                predicates.forEach(item => {
                    const [predicate, ...args] = item.split(/[(),\s]+/).filter(Boolean);
                    if (predicate === 'support' && args[1] === nodeNumber.toString()) {
                        hasNoSupport = false;
                    }
                    if (predicate === 'load' && args[0] === nodeNumber.toString()) {
                        if (args[1] === 'x') {
                            hasNoLoadX = false;
                        }
                        if (args[1] === 'y') {
                            hasLoadY = true;
                        }
                    }
                });
    
                // Check if one member is vertical and the other is not, and the node has no support, no load in 'x', and a load in 'y'
                if (isVertical(TrussString, member1) !== isVertical(TrussString, member2) &&
                    hasNoSupport && hasNoLoadX && hasLoadY) {
    
                    const nonVerticalMember = isVertical(TrussString, member1) ? member2 : member1;
    
                    // Create simplified TrussString without the node and the non-vertical member
                    const simplifiedTrussString = TrussString
                //        .replace(new RegExp(`node\\(${nodeNumber},[^)]+\\)`, 'g'), '')
                        .replace(new RegExp(`member\\(${nonVerticalMember},[^)]+\\)`, 'g'), '')
                        .replace(/,,/g, ',')  // Replace any double commas resulting from removals
                        .replace(/^\[|]$/g, '') // Remove leading and trailing square brackets
                        .replace(/^,|,$/g, '') // Remove leading and trailing commas
                        .trim();
    
                    return [true, nodeNumber, [nonVerticalMember], `[${simplifiedTrussString}]`];
                }
            }
        }
    
        return [false];
    }
    
    function zeroforce(TrussString) {
        const rules = [rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9, rule10, rule11, rule12];
    
        for (let i = 0; i < rules.length; i++) {
            const result = rules[i](TrussString);
            if (result[0]) {
                return [true, `${i + 1}`, result[1], result[2], result[3]];
            }
        }
    
        return [false];
    }

    function allzeroforces(TrussString) {
        let results = [];
        let currentTrussString = TrussString;
        let foundTrue = false;  // To track if any true is found
    
        while (true) {
            let zeroforceResult = zeroforce(currentTrussString);
            if (!zeroforceResult[0]) {
                break;
            }
    
            foundTrue = true; // Set to true if zeroforce finds a zero-force condition
            // Include only the rule number, node/member number, and simplified TrussString
            results.push([zeroforceResult[1], zeroforceResult[2], zeroforceResult[3]]);
            currentTrussString = zeroforceResult[4]; // Update TrussString with the simplified version
        }
    
        return [foundTrue, ...results];
    }

    onmessage = function(e) {

        const { TrussString } = e.data;

        console.log(' from truss worker (in): '+TrussString);

        console.log('  input string: '+TrussString);
        const result = allzeroforces(TrussString);
      console.log(' from truss worker (out): '+result.length + ' '+result);
        postMessage(result);
    };