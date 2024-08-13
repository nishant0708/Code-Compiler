import { useState } from 'react';
import './App.css';
import Editor from "@monaco-editor/react";

import Axios from 'axios';
import spinner from './spinner.svg';
import Navbar from './Navbar/Navbar';

function App() {
    const [userCode, setUserCode] = useState(``);
    const [userLang, setUserLang] = useState("python");
    const [userTheme, setUserTheme] = useState("vs-dark");
    const [fontSize, setFontSize] = useState(20);
    const [userInput, setUserInput] = useState("");
    const [userOutput, setUserOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [htmlCode, setHtmlCode] = useState("");
    const [cssCode, setCssCode] = useState("");
    const [jsCode, setJsCode] = useState("");

    const options = {
        fontSize: fontSize
    }

    function compile() {
        setLoading(true);
        if (userCode === `` && userLang !== 'webdev') {
            setLoading(false);
            setUserOutput("No Code");
            return;
        }

        if (userLang === 'webdev') {
            const iframe = document.getElementById('output-iframe');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(
                htmlCode +
                `<style>${cssCode}</style>` +
                `<script>${jsCode}</script>`
            );
            iframeDoc.close();
            setLoading(false);
        } else {
            Axios.post(`http://localhost:8000/compile`, {
                code: userCode,
                language: userLang,
                input: userInput
            }).then((res) => {
                setUserOutput(res.data.stdout || res.data.stderr);
            }).then(() => {
                setLoading(false);
            }).catch((err) => {
                console.error(err);
                setUserOutput("Error: " + (err.response ? err.response.data.error : err.message));
                setLoading(false);
            });
        }
    }

    function clearOutput() {
        setUserOutput("");
    }

    return (
        <div className="App">
            <Navbar
                userLang={userLang} setUserLang={setUserLang}
                userTheme={userTheme} setUserTheme={setUserTheme}
                fontSize={fontSize} setFontSize={setFontSize}
            />
            <div className="main">
                <div className="left-container">
                    {userLang === 'webdev' ? (
                        <div className='webdev'>
                            <p>HTML</p>
                            <Editor
                                options={options}
                                height="calc(33vh - 20px)"
                                width="100%"
                                theme={userTheme}
                                language="html"
                                value={htmlCode}
                                onChange={(value) => setHtmlCode(value)}
                                placeholder="HTML Code"
                            />
                            <p>CSS</p>
                            <Editor
                                options={options}
                                height="calc(33vh - 20px)"
                                width="100%"
                                theme={userTheme}
                                language="css"
                                value={cssCode}
                                onChange={(value) => setCssCode(value)}
                                placeholder="CSS Code"
                            />
                            <p>JavaScript</p>
                            <Editor
                                options={options}
                                height="calc(33vh - 20px)"
                                width="100%"
                                theme={userTheme}
                                language="javascript"
                                value={jsCode}
                                onChange={(value) => setJsCode(value)}
                                placeholder="JavaScript Code"
                            />
                        </div>
                    ) : (
                        <Editor
                            options={options}
                            height="calc(100vh - 50px)"
                            width="100%"
                            theme={userTheme}
                            language={userLang}
                            defaultLanguage="python"
                            defaultValue="# Enter your code here"
                            onChange={(value) => { setUserCode(value) }}
                        />
                    )}
                    <button className="run-btn" onClick={compile}>
                        Run
                    </button>
                </div>
                <div className="right-container">
                    {userLang !== 'webdev' && (
                        <>
                            <h4>Input:</h4>
                            <div className="input-box">
                                <textarea id="code-inp" onChange={(e) => setUserInput(e.target.value)}></textarea>
                            </div>
                        </>
                    )}
                    <h4>Output:</h4>
                    {loading ? (
                        <div className="spinner-box">
                            <img src={spinner} alt="Loading..." />
                        </div>
                    ) : (
                        userLang === 'webdev' ? (
                            <iframe id="output-iframe" className="output-iframe" />
                        ) : (
                            <div className="output-box">
                                <pre>{userOutput}</pre>
                                <button onClick={clearOutput} className="clear-btn">
                                    Clear
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
