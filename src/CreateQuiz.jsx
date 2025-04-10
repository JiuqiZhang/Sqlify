import React, { useState } from 'react';
import {
  Box, CssBaseline, Typography, Stack, TextField, Button, IconButton, Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import AppTheme from './shared-theme/AppTheme';
import ColorModeSelect from './shared-theme/ColorModeSelect';

export default function CreateQuiz(props) {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const instructorId = user.user_id;

  const [title, setTitle] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [questions, setQuestions] = useState([{ text: '', correctAnswer: '' }]);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', correctAnswer: '' }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!title || questions.length === 0) {
      setStatus('Title and at least one question are required.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('params',{instructorId,
        moduleId,
        title,
        difficultyLevel,
        questions,})
      const res = await axios.post('http://localhost:8000/instructor/newquizzes', {
        instructorId,
        moduleId,
        title,
        difficultyLevel,
        questions,
      });

      if (res.data.success) {
        setStatus('Quiz created successfully!');
        setTimeout(() => {
          navigate(`/course/${courseId}/module/${moduleId}`);
        }, 1000);
      } else {
        setStatus(res.data.message || 'Quiz creation failed.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Server error during quiz creation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: 16, right: 16 }} />

      <Box sx={{ padding: 4, maxWidth: 900, margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom>
          Create New Quiz (Module #{moduleId})
        </Typography>

        {status && <Alert severity="info" sx={{ mb: 2 }}>{status}</Alert>}

        <Stack spacing={2}>
          <TextField
            label="Quiz Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Difficulty Level"
            type="number"
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(Number(e.target.value))}
          />

          <Typography variant="h6">Questions</Typography>
          {questions.map((q, i) => (
            <Box key={i} sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2 }}>
              <TextField
                fullWidth
                label={`Question ${i + 1}`}
                value={q.text}
                onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Correct Answer"
                value={q.correctAnswer}
                onChange={(e) => updateQuestion(i, 'correctAnswer', e.target.value)}
              />
              <Box sx={{ textAlign: 'right' }}>
                <IconButton onClick={() => removeQuestion(i)}><Delete /></IconButton>
              </Box>
            </Box>
          ))}

          <Button startIcon={<Add />} onClick={addQuestion}>
            Add Question
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Create Quiz'}
          </Button>
        </Stack>
      </Box>
    </AppTheme>
  );
}
