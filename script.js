document.addEventListener('DOMContentLoaded', function() {
    // Initialize Chart
    const ctx = document.getElementById('price-chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['دلار', 'سکه تمام', 'نیم سکه', 'ربع سکه'],
            datasets: [{
                label: 'قیمت (تومان)',
                backgroundColor: [
                    '#2ecc71',
                    '#f1c40f',
                    '#e67e22',
                    '#e74c3c'
                ],
                borderColor: [
                    '#27ae60',
                    '#f39c12',
                    '#d35400',
                    '#c0392b'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'مقایسه قیمت‌های طلا و ارز',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toLocaleString('fa-IR') + ' تومان';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('fa-IR');
                        }
                    }
                }
            }
        }
    });

    // Fetch data on page load
    fetchPrices();

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', fetchPrices);

    // Fetch prices function
    async function fetchPrices() {
        try {
            document.getElementById('refresh-btn').disabled = true;
            document.getElementById('refresh-btn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال دریافت...';
            
            const response = await fetch('/api/prices');
            const data = await response.json();
            
            if (data.success) {
                updateUI(data.data);
                updateChart(data.data, chart);
            } else {
                throw new Error(data.message || 'خطا در دریافت داده‌ها');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('خطا در دریافت اطلاعات: ' + error.message);
        } finally {
            document.getElementById('refresh-btn').disabled = false;
            document.getElementById('refresh-btn').innerHTML = '<i class="fas fa-sync-alt"></i> به‌روزرسانی';
        }
    }

    function updateUI(data) {
        // Update prices
        document.getElementById('dollar-price').textContent = data.dollar.price.toLocaleString('fa-IR');
        document.getElementById('coin-price').textContent = data.coin.price.toLocaleString('fa-IR');
        document.getElementById('halfcoin-price').textContent = data.halfcoin.price.toLocaleString('fa-IR');
        document.getElementById('quartercoin-price').textContent = data.quartercoin.price.toLocaleString('fa-IR');
        
        // Update changes
        updateChangeElement('dollar-change', data.dollar.change, data.dollar.changePercent);
        updateChangeElement('coin-change', data.coin.change, data.coin.changePercent);
        updateChangeElement('halfcoin-change', data.halfcoin.change, data.halfcoin.changePercent);
        updateChangeElement('quartercoin-change', data.quartercoin.change, data.quartercoin.changePercent);
        
        // Update time
        document.getElementById('update-time').textContent = `آخرین به‌روزرسانی: ${new Date(data.lastUpdate).toLocaleString('fa-IR')}`;
    }

    function updateChangeElement(elementId, change, changePercent) {
        const element = document.getElementById(elementId);
        const amountSpan = element.querySelector('.change-amount');
        const percentSpan = element.querySelector('.change-percent');
        
        amountSpan.textContent = change > 0 ? `+${change.toLocaleString('fa-IR')}` : change.toLocaleString('fa-IR');
        percentSpan.textContent = change > 0 ? `+${changePercent}%` : `${changePercent}%`;
        
        // Set color based on change
        if (change > 0) {
            element.className = 'change positive';
        } else if (change < 0) {
            element.className = 'change negative';
        } else {
            element.className = 'change';
        }
    }

    function updateChart(data, chart) {
        chart.data.datasets[0].data = [
            data.dollar.price,
            data.coin.price,
            data.halfcoin.price,
            data.quartercoin.price
        ];
        chart.update();
    }
});