document.addEventListener("DOMContentLoaded", async () => {
    const problemId = sessionStorage.getItem('problemId');
    const token = sessionStorage.getItem('token');
    
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    const problemTitleElement = document.getElementById("problem-title");
    const problemDescriptionElement = document.getElementById("problem-description");
    const problemIOElement = document.getElementById("problem-input-output");
    const codeEditor = document.getElementById("code-editor");
    const submitButton = document.getElementById("submit-code-button");

    // Initialize CodeMirror editor
    const editor = CodeMirror.fromTextArea(codeEditor, {
        lineNumbers: true,
        mode: "javascript",
        theme: "dracula",
    });

    // Fetch problem details using problemId
    try {
        const response = await fetch(`https://collegeproject-fnkx.onrender.com/api/problems/${problemId}`);
        if (response.ok) {
            const problem = await response.json();

            // Update the problem title, description, and input/output formats
            if (problemTitleElement) {
                problemTitleElement.textContent = problem.title;
            }

            if (problemDescriptionElement) {
                problemDescriptionElement.textContent = problem.description;
            }

            if (problemIOElement) {
                problemIOElement.textContent = `Input: ${problem.input || 'N/A'}\nOutput: ${problem.output || 'N/A'}\nConstraints: ${problem.constraints || 'N/A'}`;
            }
        } else {
            console.error("Problem not found.");
        }
    } catch (error) {
        console.error("Error fetching problem:", error);
    }

    // Handle code submission
    if (submitButton) {
        submitButton.addEventListener("click", async () => {
            const code = editor.getValue();

            if (!code) {
                alert("Please write some code.");
                return;
            }

            const language = document.getElementById("language").value;
            const languageId = getLanguageId(language);

            // Submit the code to the backend for evaluation
            try {
                const response = await fetch("https://collegeproject-fnkx.onrender.com/api/submissions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        problem: problemId,
                        code: code,
                        language_id: languageId,
                        stdin: "",
                    }),
                });

                const result = await response.json();
                if (response.ok && result.submission) {
                    const { status, output, execution_time, memory_usage } = result.submission;

                    // Display the result of code submission
                    document.getElementById("resultMessage").innerText = `Status: ${status}\nOutput: ${output}`;
                    document.getElementById("executionResults").style.display = "block";
                    // document.getElementById("status").innerText = status;
                    // document.getElementById("output").innerText = output || "No Output";
                    document.getElementById("execution-time").innerText = execution_time ? `${execution_time} sec` : "N/A";
                    document.getElementById("memory-usage").innerText = memory_usage ? `${memory_usage} MB` : "N/A";
                } else {
                    console.error("Error submitting code:", result);
                }
            } catch (error) {
                console.error("Error submitting code:", error);
            }
        });
    }

    // Function to map language selection to corresponding language ID
    function getLanguageId(language) {
        switch (language) {
            case 'python':
                return 71;  // Python
            case 'java':
                return 62;  // Java
            case 'cpp':
                return 54;  // C++
            default:
                return 71;  // Default to Python
        }
    }
});

// Function to show hint for the selected problem
function showHint() {
    const problemId = sessionStorage.getItem('problemId');

    fetch(`https://collegeproject-fnkx.onrender.com/api/problems/${problemId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.hint) {
                alert(`Hint: ${data.hint}`);
            } else {
                alert("No hint available for this problem.");
            }
        })
        .catch(error => {
            console.error("Error fetching hint:", error);
            alert("Failed to fetch hint.");
        });
}
