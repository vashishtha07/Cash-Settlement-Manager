import { BinaryHeap } from './heap.js';

onload = function (){
    let curr_data;
    const container = document.getElementById('mynetwork');
    const container2 = document.getElementById('mynetwork2');
    const genNew = document.getElementById('generate-graph');
    const solve = document.getElementById('solve');
    const temptext = document.getElementById('temptext');
    const inputContainer = document.getElementById('input-container');
    const amountInputs = document.getElementById('amountInputs');
    const generateInputs = document.getElementById('generate-inputs');
    const numPeopleInput = document.getElementById('numPeople');
    const buttonContainer = document.querySelector('.button-container');
    const containerDiv = document.getElementById('container');

    // initialise graph options
    const options = {
        edges: {
            arrows: {
                to: true
            },
            labelHighlightBold: true,
            font: {
                size: 20
            }
        },
        nodes: {
            font: '12px arial black',
            scaling: {
                label: true
            },
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf183',
                size: 50,
                color: '#991133',
            }
        }
    };
    
    let network = new vis.Network(container);
    network.setOptions(options);
    let network2 = new vis.Network(container2);
    network2.setOptions(options);

    //Click Event: Generating Inputs When the user clicks the "Generate Inputs" button, the following JavaScript code 
    //is executed. This is where we dynamically create input fields based on the number of people.
    generateInputs.onclick = function(){

        amountInputs.innerHTML = ''; // Clear previous inputs
        const numPeople = parseInt(numPeopleInput.value);
        // This retrieves the number of people involved in the transaction. The value is fetched from the 
        //numPeopleInput field. The parseInt function ensures the input is treated as an integer.

        if (numPeople <= 0) {
            alert('Please enter a valid number of people!');
            return;
        }
        
        for (let i = 1; i <= numPeople; i++) {
            for (let j = i + 1; j <= numPeople; j++) {
                const div = document.createElement('div');  //A div element is created to wrap each 
                                                            //input field along with its label. The div 
                                                            //serves as a container to structure the input and label elements neatly.
                div.className = 'form-group';   //The form-group class is used to wrap a label, input, and other form elements to provide 
                                                //a consistent layout and spacing between them.

                const label = document.createElement('label');    //A label element is created to describe each input field, ensuring 
                                                   //well-aligned, and properly styled according to Bootstrap's design language.
                // initialize your network!
                      //the user knows which transaction the input corresponds to.
                      label.innerText = `Amount from Person ${i} to Person ${j}:`;
                      //The text of the label is dynamically set to "Amount from Person i to Person j", where i and j are the indices 
                      //of the two people in the current iteration of the loops.
      
      
                      const input = document.createElement('input');
                      input.type = 'number';              //ensuring that only numeric values can be entered.
                      input.className = 'form-control';   //Another part of Bootstrap’s form styling system. It makes the input field responsive, 
                input.id = `amount_${i}_${j}`;
                input.value = 0; // Default value

                div.appendChild(label);   //The label and input elements are appended to the previously created div. This ensures that 
                                          //each input field and its corresponding label are grouped together inside the same div.
                div.appendChild(input);  
                amountInputs.appendChild(div);  //The fully constructed div (containing both the label and input) is appended to the amountInputs container.
            }
        }

        // After the input fields are generated, the form container and buttons are made visible using this code:
        containerDiv.style.display = 'flex';   //makes the section containing the generated inputs and graph visible.
        buttonContainer.style.display = 'block';  // makes the buttons "Visualize Problem" and "Solve" visible after the inputs are generated.
    };

    genNew.onclick = function () {  //This function is executed when the "Get New Problem" button is clicked.
        const data = createData();  //  //The createData function is called to generate a new random graph. This graph consists of nodes (people) and edges (cash flows).
        curr_data = data;
        network.setData(data);
        temptext.style.display = "inline";
        container2.style.display = "none";
    };

    solve.onclick = function () {  //This function is executed when the "Solve" button is clicked.
        temptext.style.display = "none";
        container2.style.display = "inline";
        const solvedData = solveData();     //The solveData function is called to process the current graph 
                                            //(curr_data) and generate a solved version of it. This function calculates the net balance for each person and adjusts the edges accordingly to settle the debts optimally.
        network2.setData(solvedData);       //The solved data is set to the network2 object, which is another instance of vis.Network. 
    };


    function createData() {    //is designed to generate a graph using the vis.js
        const numPeople = parseInt(numPeopleInput.value);

        // Adding people to nodes array
        let nodes = [];
        for (let i = 1; i <= numPeople; i++) {
            nodes.push({ id: i, label: "Person " + i });
        }
        nodes = new vis.DataSet(nodes);   //converting the generated value to tha format of vis.js

        // Creating edges with user-provided amounts
        const edges = [];
        for (let i = 1; i <= numPeople; i++) {
            for (let j = i + 1; j <= numPeople; j++) {
                const amountInput = document.getElementById(`amount_${i}_${j}`);
                const amount = parseInt(amountInput.value);

                if (amount > 0) {
                    edges.push({ from: i, to: j, label: String(amount) });
                } else if (amount < 0) {
                    edges.push({ from: j, to: i, label: String(-amount) });
                }
            }
        }

        const data = {
            nodes: nodes,
            edges: edges
        };
        return data;
    }

    function solveData(){
        let data = curr_data;
        const sz = data['nodes'].length;
        const vals = Array(sz).fill(0);

        // Calculating net balance of each person
        for (let i = 0; i < data['edges'].length; i++) {
            const edge = data['edges'][i];
            vals[edge['to'] - 1] += parseInt(edge['label']);
            vals[edge['from'] - 1] -= parseInt(edge['label']);
        }

        const pos_heap = new BinaryHeap();
        const neg_heap = new BinaryHeap();

        for (let i = 0; i < sz; i++) {
            if (vals[i] > 0) {
                pos_heap.insert([vals[i], i]);
            } else {
                neg_heap.insert(([-vals[i], i]));
                vals[i] *= -1;
            }
        }

        const new_edges = [];
        while (!pos_heap.empty() && !neg_heap.empty()) {
            const mx = pos_heap.extractMax();
            const mn = neg_heap.extractMax();

            const amt = Math.min(mx[0], mn[0]);
            const to = mx[1];
            const from = mn[1];

            new_edges.push({ from: from + 1, to: to + 1, label: String(Math.abs(amt)) });
            vals[to] -= amt;
            vals[from] -= amt;

            if (mx[0] > mn[0]) {
                pos_heap.insert([vals[to], to]);
            } else if (mx[0] < mn[0]) {
                neg_heap.insert([vals[from], from]);
            }
        }

        data = {
            nodes: data['nodes'],
            edges: new_edges
        };
        return data;
    }
};