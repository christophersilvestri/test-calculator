document.addEventListener('DOMContentLoaded', () => {
    const hourlyRateInput = document.getElementById('hourlyRate');
    const totalHoursSpan = document.getElementById('totalHours');
    const totalCostSpan = document.getElementById('totalCost');
    const exportBtn = document.getElementById('exportBtn');
    let customTaskCounter = 1;

    // Function to calculate total hours and cost
    function calculateTotal() {
        let totalHours = 0;
        const tasks = document.querySelectorAll('.task');

        tasks.forEach(task => {
            const checkbox = task.querySelector('input[type="checkbox"]');
            const hoursInput = task.querySelector('.hours');
            const quantityInput = task.querySelector('.quantity');

            if (checkbox.checked) {
                const hours = parseFloat(hoursInput.value) || 0;
                const quantity = quantityInput ? parseFloat(quantityInput.value) || 1 : 1;
                totalHours += hours * quantity;
            }
        });

        const hourlyRate = parseFloat(hourlyRateInput.value) || 0;
        const totalCost = totalHours * hourlyRate;

        totalHoursSpan.textContent = totalHours.toFixed(1);
        totalCostSpan.textContent = `$${totalCost.toFixed(2)}`;
    }

    // Function to handle checkbox changes
    function handleCheckboxChange(e) {
        const task = e.target.closest('.task');
        if (e.target.checked) {
            task.classList.add('selected');
        } else {
            task.classList.remove('selected');
        }
        calculateTotal();
    }

    // Function to remove a task
    function removeTask(task) {
        task.remove();
        calculateTotal();
    }

    // Function to create a new custom task
    function createCustomTask(category) {
        const taskId = `custom-task-${customTaskCounter++}`;
        const taskHtml = `
            <div class="task" data-hours="0">
                <button class="remove-task-btn" title="Remove task">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="task-header">
                    <input type="checkbox" id="${taskId}">
                    <label for="${taskId}" contenteditable="true">Custom Task</label>
                </div>
                <div class="task-inputs">
                    <div class="input-group">
                        <span>Hours:</span>
                        <input type="number" class="hours" value="0" min="0">
                    </div>
                </div>
            </div>
        `;

        const tasksGrid = category.querySelector('.tasks-grid');
        tasksGrid.insertAdjacentHTML('beforeend', taskHtml);

        // Add event listeners to new elements
        const newTask = tasksGrid.lastElementChild;
        const checkbox = newTask.querySelector('input[type="checkbox"]');
        const hoursInput = newTask.querySelector('.hours');
        const removeBtn = newTask.querySelector('.remove-task-btn');
        
        checkbox.addEventListener('change', handleCheckboxChange);
        hoursInput.addEventListener('input', calculateTotal);
        hoursInput.addEventListener('change', calculateTotal);
        removeBtn.addEventListener('click', () => removeTask(newTask));

        // Make the label immediately editable
        const label = newTask.querySelector('label');
        label.focus();
        
        // Prevent checkbox toggle when editing label
        label.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    // Add event listeners to all checkboxes
    document.querySelectorAll('.task input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });

    // Add event listeners to all inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', calculateTotal);
        input.addEventListener('input', calculateTotal);
    });

    // Add event listeners to "Add Custom Task" buttons
    document.querySelectorAll('.add-task-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.closest('.category');
            createCustomTask(category);
        });
    });

    // Export to CSV functionality
    exportBtn.addEventListener('click', () => {
        const stages = {
            'Intake': [],
            'Research and Strategy': [],
            'Message Testing': [],
            'Website Copy': []
        };
        
        let csvContent = "Copy Estimate Breakdown\n\n";
        let totalHours = 0;
        const hourlyRate = parseFloat(hourlyRateInput.value) || 0;

        // Gather tasks by stage
        document.querySelectorAll('.category').forEach(category => {
            const stageName = category.querySelector('h2').textContent.substring(3); // Remove the number prefix
            const tasks = category.querySelectorAll('.task');
            
            tasks.forEach(task => {
                const checkbox = task.querySelector('input[type="checkbox"]');
                if (checkbox.checked) {
                    const label = task.querySelector('label').textContent;
                    const hours = parseFloat(task.querySelector('.hours').value) || 0;
                    const quantity = task.querySelector('.quantity') ? 
                        parseFloat(task.querySelector('.quantity').value) || 1 : 1;
                    const subtotal = hours * quantity;
                    
                    stages[stageName].push({
                        task: label,
                        hours,
                        quantity,
                        subtotal
                    });
                    
                    totalHours += subtotal;
                }
            });
        });

        // Build CSV content with stages
        for (const [stageName, tasks] of Object.entries(stages)) {
            if (tasks.length > 0) {
                csvContent += `\n${stageName}\n`;
                csvContent += "Task,Hours,Quantity,Subtotal Hours\n";
                
                let stageTotal = 0;
                tasks.forEach(task => {
                    csvContent += `"${task.task}",${task.hours},${task.quantity},${task.subtotal}\n`;
                    stageTotal += task.subtotal;
                });
                
                csvContent += `Stage Total Hours,,,,${stageTotal}\n`;
            }
        }

        // Add final summary
        const totalCost = totalHours * hourlyRate;
        csvContent += `\nSummary\n`;
        csvContent += `Total Hours,${totalHours}\n`;
        csvContent += `Hourly Rate,$${hourlyRate}\n`;
        csvContent += `Total Cost,$${totalCost.toFixed(2)}\n`;

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'copy_estimate.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Initialize the calculation
    calculateTotal();
}); 