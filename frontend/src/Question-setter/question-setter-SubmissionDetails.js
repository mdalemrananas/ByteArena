import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaTrophy, FaUsers, FaFileAlt, FaComments, FaPlay,
  FaChevronLeft
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import './question-setter-SubmissionDetails.css';

const QuestionSetterSubmissionDetails = () => {
  const navigate = useNavigate();
  const { questionId, userId } = useParams();
  const [question, setQuestion] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load question and submission data
    const loadData = () => {
      // Dummy question data
      const dummyQuestions = [
        {
          id: 1,
          title: 'Regular Expression Matching',
          description: `Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:

'.' Matches any single character.
'*' Matches zero or more of the preceding element.

The matching should cover the entire input string (not partial).`,
          examples: [
            {
              input: 's = "aa", p = "a"',
              output: 'false',
              explanation: '"a" does not match the entire string "aa".'
            },
            {
              input: 's = "aa", p = "a*"',
              output: 'true',
              explanation: '"*" means zero or more of the preceding element, "a". Therefore, by repeating "a" once, it becomes "aa".'
            },
            {
              input: 's = "ab", p = ".*"',
              output: 'true',
              explanation: '".*" means "zero or more (*) of any character (.)".'
            }
          ],
          constraints: [
            '1 <= s.length <= 20',
            '1 <= p.length <= 30',
            's contains only lowercase English letters.',
            'p contains only lowercase English letters, \'.\', and \'*\'.',
            'It is guaranteed for each appearance of the character \'*\', there will be a previous valid character to match.'
          ],
          difficulty: 'Hard'
        }
      ];

      // Dummy submission data
      const dummySubmissions = [
        {
          id: 1,
          questionId: 1,
          userId: 'User1',
          language: 'C++',
          code: `#include <bits/stdc++.h>
using namespace std;

string trim(const string &s) {
    int start = s.find_first_not_of(" \\t\\n\\r");
    if (start == string::npos) return "";
    int end = s.find_last_not_of(" \\t\\n\\r");
    return s.substr(start, end - start + 1);
}

vector<string> split(const string &s) {
    vector<string> tokens;
    stringstream ss(s);
    string token;
    while (ss >> token) {
        tokens.push_back(token);
    }
    return tokens;
}

/*
 * Complete the 'countStrings' function below.
 *
 * The function is expected to return an INTEGER.
 * The function accepts following parameters:
 *  1. STRING r
 *  2. INTEGER l
 */

int countStrings(string r, int l) {
    // TODO: Implement the function
    return 0;
}

int main() {
    ofstream fout(getenv("OUTPUT_PATH"));
    
    int T;
    cin >> T;
    cin.ignore();
    
    for (int t = 0; t < T; t++) {
        string line;
        getline(cin, line);
        
        vector<string> parts = split(line);
        string r = parts[0];
        int l = stoi(parts[1]);
        
        int result = countStrings(r, l);
        
        fout << result << "\\n";
    }
    
    fout.close();
    return 0;
}`,
          submittedAt: '2024-01-15 14:30:00',
          status: 'Correct',
          executionTime: '1.2s',
          memoryUsed: '256 MB'
        },
        {
          id: 2,
          questionId: 1,
          userId: 'User2',
          language: 'Java',
          code: `import java.util.*;
import java.io.*;

public class Solution {
    public static int countStrings(String r, int l) {
        // TODO: Implement the function
        return 0;
    }
    
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        PrintWriter pw = new PrintWriter(System.out);
        
        int T = Integer.parseInt(br.readLine());
        
        for (int t = 0; t < T; t++) {
            String[] parts = br.readLine().split(" ");
            String r = parts[0];
            int l = Integer.parseInt(parts[1]);
            
            int result = countStrings(r, l);
            pw.println(result);
        }
        
        pw.close();
    }
}`,
          submittedAt: '2024-01-15 15:45:00',
          status: 'Wrong',
          executionTime: '2.1s',
          memoryUsed: '512 MB'
        }
      ];

      const foundQuestion = dummyQuestions.find(q => q.id === parseInt(questionId || 1));
      const foundSubmission = dummySubmissions.find(s => s.userId === userId || s.id === 1);

      if (foundQuestion) {
        setQuestion(foundQuestion);
      }

      if (foundSubmission) {
        setSubmission(foundSubmission);
      }

      setLoading(false);
    };

    loadData();
  }, [questionId, userId]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="qs-submission-details-layout">
        <div className="qs-loading">Loading...</div>
      </div>
    );
  }

  if (!question || !submission) {
    return (
      <div className="qs-submission-details-layout">
        <div className="qs-error">Submission not found</div>
      </div>
    );
  }

  return (
    <div className="qs-submission-details-layout">
      {/* Sidebar */}
      <aside className="qs-sidebar">
        <div className="qs-sidebar-logo">
          <span className="qs-logo-byte">Byte</span>
          <span className="qs-logo-arena">Arena</span>
        </div>
        <nav className="qs-sidebar-nav">
          <button 
            className="qs-nav-item"
            onClick={() => navigate('/question-setter')}
          >
            <FaHome className="qs-nav-icon" />
            <span className="qs-nav-text">Home</span>
          </button>
          <button 
            className="qs-nav-item active"
            onClick={() => navigate('/question-setter/explore')}
          >
            <FaSearch className="qs-nav-icon" />
            <span className="qs-nav-text">Explore Questions</span>
          </button>
          <button 
            className="qs-nav-item"
            onClick={() => navigate('/question-setter/contest')}
          >
            <FaTrophy className="qs-nav-icon" />
            <span className="qs-nav-text">Contest</span>
          </button>
          <button 
            className="qs-nav-item"
            onClick={() => navigate('/question-setter/leaderboard')}
          >
            <FaUsers className="qs-nav-icon" />
            <span className="qs-nav-text">Leaderboard</span>
          </button>
          <button 
            className="qs-nav-item"
            onClick={() => navigate('/question-setter/profile')}
          >
            <FaUserCircle className="qs-nav-icon" />
            <span className="qs-nav-text">Profile</span>
          </button>
          <button 
            className="qs-nav-item qs-nav-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="qs-nav-icon" />
            <span className="qs-nav-text">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="qs-main-content">
        {/* Header */}
        <header className="qs-header">
          <div className="qs-header-left">
            <div className="qs-logo-header">
              <span className="qs-logo-byte-header">Byte</span>
              <span className="qs-logo-arena-header">Arena</span>
            </div>
            <div className="qs-search-bar">
              <FaSearch className="qs-search-icon" />
              <input 
                type="text" 
                placeholder="Search Questions, Contest, Leaderboard..." 
                className="qs-search-input"
              />
            </div>
          </div>
          <div className="qs-header-right">
            <button className="qs-header-icon-btn qs-notification-btn" title="Messages">
              <FaComments />
              <span className="qs-notification-badge">2</span>
            </button>
            <button className="qs-header-icon-btn qs-notification-btn" title="Notifications">
              <FaBell />
              <span className="qs-notification-badge">1</span>
            </button>
            <button className="qs-header-icon-btn" title="Settings">
              <FaCog />
            </button>
            <button 
              className="qs-header-icon-btn qs-notification-btn" 
              title="Profile"
              onClick={() => navigate('/question-setter/profile')}
            >
              <FaUserCircle />
              <span className="qs-notification-badge">3</span>
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="qs-submission-nav-tabs">
          <button 
            className="qs-submission-nav-tab"
            onClick={() => navigate(`/question-setter/question/${questionId}`)}
          >
            <FaChevronLeft /> Back to Question
          </button>
          <div className="qs-submission-nav-links">
            <button 
              className="qs-submission-nav-link"
              onClick={() => navigate(`/question-setter/question/${questionId}`)}
            >
              Overview
            </button>
            <button 
              className="qs-submission-nav-link active"
              onClick={() => {}}
            >
              Submissions
            </button>
            <button 
              className="qs-submission-nav-link"
              onClick={() => navigate(`/question-setter/question/${questionId}`)}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="qs-submission-content-area">
          <div className="qs-submission-container">
            {/* Left Side - Question Details */}
            <div className="qs-submission-question-panel">
              <div className="qs-submission-question-content">
                <h1 className="qs-submission-problem-title">Problem</h1>
                
                <div className="qs-submission-problem-description">
                  {question.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                <h2 className="qs-submission-section-heading">Task</h2>
                <p className="qs-submission-task">Given a regular expression and an integer, L, count how many strings of length L are recognized by it.</p>

                <h2 className="qs-submission-section-heading">Input Format</h2>
                <div className="qs-submission-format">
                  <p>First line: integer T (number of test cases).</p>
                  <p>Each subsequent test case: a regular expression R (string) and an integer L.</p>
                </div>

                <h2 className="qs-submission-section-heading">Constraints</h2>
                <ul className="qs-submission-constraints">
                  {question.constraints.map((constraint, index) => (
                    <li key={index}>
                      <code>{constraint}</code>
                    </li>
                  ))}
                </ul>

                <h2 className="qs-submission-section-heading">Output Format</h2>
                <p className="qs-submission-format-text">Print T lines, each with the answer for the corresponding test case. Answers should be output modulo 10^9 + 7.</p>

                <h2 className="qs-submission-section-heading">Sample Input</h2>
                <div className="qs-submission-sample">
                  <code className="qs-submission-code-block">
                    3<br/>
                    (a|b) 2<br/>
                    (a|b)* 5<br/>
                    ((a*)|b(a*)) 100
                  </code>
                </div>

                <h2 className="qs-submission-section-heading">Sample Output</h2>
                <div className="qs-submission-sample">
                  <code className="qs-submission-code-block">
                    2<br/>
                    32<br/>
                    100
                  </code>
                </div>

                <h2 className="qs-submission-section-heading">Explanation</h2>
                <div className="qs-submission-explanation">
                  {question.examples && question.examples.map((example, index) => (
                    <div key={index} className="qs-submission-explanation-item">
                      <p><strong>First case ({example.input} → Output: {example.output}):</strong></p>
                      <p>{example.explanation || 'Explanation for this case.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Code Editor */}
            <div className="qs-submission-code-panel">
              <div className="qs-submission-code-header">
                <div className="qs-submission-code-info">
                  <span className="qs-submission-user">{submission.userId}</span>
                  <span className="qs-submission-language">{submission.language}</span>
                  <span className={`qs-submission-status qs-status-${submission.status.toLowerCase()}`}>
                    {submission.status}
                  </span>
                </div>
                <div className="qs-submission-code-actions">
                  <button className="qs-submission-action-btn">
                    <FaPlay /> Start Timer
                  </button>
                </div>
              </div>
              
              <div className="qs-submission-code-editor">
                <pre className="qs-code-content">
                  <code>{submission.code}</code>
                </pre>
              </div>

              <div className="qs-submission-code-footer">
                <div className="qs-submission-meta">
                  <span>Submitted: {submission.submittedAt}</span>
                  <span>Time: {submission.executionTime}</span>
                  <span>Memory: {submission.memoryUsed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetterSubmissionDetails;

