document.addEventListener('DOMContentLoaded', () => {
    const hourlyRateInput = document.getElementById('hourlyRate');
    const totalHoursSpan = document.getElementById('totalHours');
    const totalCostSpan = document.getElementById('totalCost');
    const exportBtn = document.getElementById('exportBtn');

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

    // Add event listeners to all inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', calculateTotal);
        input.addEventListener('input', calculateTotal);
    });

    // Export to CSV functionality
    exportBtn.addEventListener('click', () => {
        const tasks = document.querySelectorAll('.task');
        let csvContent = "Task,Hours,Quantity,Subtotal\n";

        tasks.forEach(task => {
            const checkbox = task.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                const label = task.querySelector('label').textContent;
                const hours = parseFloat(task.querySelector('.hours').value) || 0;
                const quantity = task.querySelector('.quantity') ? 
                    parseFloat(task.querySelector('.quantity').value) || 1 : 1;
                const subtotal = hours * quantity;
                
                csvContent += `"${label}",${hours},${quantity},${subtotal}\n`;
            }
        });

        // Add totals
        const totalHours = parseFloat(totalHoursSpan.textContent);
        const totalCost = parseFloat(totalCostSpan.textContent.replace('$', ''));
        csvContent += `\nTotal Hours,${totalHours}\n`;
        csvContent += `Total Cost,$${totalCost}\n`;

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