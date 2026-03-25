-- Insert sample data for Doubtify platform

-- Insert subjects
INSERT INTO subjects (name, description, color_code, icon) VALUES
('Mathematics', 'Mathematical concepts, equations, and problem-solving', '#3B82F6', 'Calculator'),
('Physics', 'Physics principles, theories, and experiments', '#8B5CF6', 'Atom'),
('Chemistry', 'Chemical reactions, compounds, and laboratory work', '#10B981', 'TestTube'),
('Biology', 'Life sciences, organisms, and biological processes', '#059669', 'Microscope'),
('Programming', 'Software development, coding, and computer science', '#F59E0B', 'Code'),
('English', 'Literature, grammar, and language studies', '#EF4444', 'BookOpen'),
('Languages', 'Foreign languages and linguistics', '#EC4899', 'Languages'),
('History', 'Historical events, cultures, and civilizations', '#8B4513', 'Clock'),
('Geography', 'Earth sciences, maps, and environmental studies', '#22C55E', 'Globe'),
('Economics', 'Economic theories, markets, and financial concepts', '#6366F1', 'TrendingUp');

-- Insert sample users (passwords are hashed for 'password123')
INSERT INTO users (username, email, password_hash, first_name, last_name, bio) VALUES
('admin', 'admin@doubtify.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthyZwOtLyGu2nq', 'Admin', 'User', 'Platform administrator'),
('sarah_chen', 'sarah.chen@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthyZwOtLyGu2nq', 'Sarah', 'Chen', 'Computer Science student passionate about algorithms'),
('rahul_sharma', 'rahul.sharma@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthyZwOtLyGu2nq', 'Rahul', 'Sharma', 'Mathematics enthusiast and problem solver'),
('priya_singh', 'priya.singh@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthyZwOtLyGu2nq', 'Priya', 'Singh', 'Physics student interested in quantum mechanics'),
('alex_kumar', 'alex.kumar@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthyZwOtLyGu2nq', 'Alex', 'Kumar', 'Web developer and React enthusiast'),
('maya_verma', 'maya.verma@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthyZwOtLyGu2nq', 'Maya', 'Verma', 'Chemistry student with a love for organic chemistry'),
('arjun_patel', 'arjun.patel@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthyZwOtLyGu2nq', 'Arjun', 'Patel', 'English literature student and grammar enthusiast'),
('divya_nair', 'divya.nair@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthyZwOtLyGu2nq', 'Divya', 'Nair', 'Multilingual student studying Spanish and French');

-- Update admin role
UPDATE users SET role = 'admin' WHERE username = 'admin';

-- Insert user reputation records
INSERT INTO user_reputation (user_id, total_reputation, doubts_asked, responses_given, responses_accepted, upvotes_received, downvotes_received, streak_days) VALUES
(2, 4250, 12, 45, 23, 89, 5, 12),
(3, 3180, 8, 32, 18, 67, 3, 8),
(4, 2940, 15, 28, 14, 56, 7, 6),
(5, 3670, 10, 38, 21, 78, 4, 15),
(6, 2450, 18, 25, 12, 45, 8, 4),
(7, 3890, 7, 42, 25, 82, 2, 18),
(8, 2760, 13, 30, 16, 58, 6, 9);

-- Insert sample doubts
INSERT INTO doubts (title, description, author_id, subject_id, status, tags, views_count) VALUES
('How to solve differential equations using integration by parts?', 'I''m stuck on solving ∫x*e^x dx using integration by parts. Can someone explain the step-by-step process? I understand the formula uv - ∫v du but I''m confused about choosing u and dv correctly.', 3, 1, 'resolved', ARRAY['calculus', 'integration', 'differential-equations'], 456),
('Quantum entanglement - can someone explain like I''m 5?', 'I''ve been reading about quantum entanglement but the explanations are too complex. Looking for a simpler explanation that doesn''t require advanced physics knowledge. What exactly happens when particles become entangled?', 4, 2, 'answered', ARRAY['quantum-physics', 'entanglement', 'beginner'], 234),
('React hooks - useEffect vs useLayoutEffect?', 'What''s the practical difference between useEffect and useLayoutEffect? When should I use one over the other? I''ve read the docs but I''m looking for real-world examples and use cases.', 5, 5, 'resolved', ARRAY['react', 'hooks', 'useeffect', 'javascript'], 678),
('Electron configuration and orbital diagrams', 'Can someone help me understand how to write electron configurations using the aufbau principle? I''m particularly confused about the order of filling orbitals and when to use noble gas notation.', 6, 3, 'open', ARRAY['chemistry', 'electron-configuration', 'orbital-diagrams'], 167),
('Perfect tenses in English grammar', 'What''s the difference between present perfect and present perfect continuous? Can you provide examples? I keep mixing them up and would like clear explanations with examples.', 7, 6, 'answered', ARRAY['grammar', 'tenses', 'english'], 298),
('Spanish subjunctive mood - when to use?', 'I''m confused about when to use subjunctive vs indicative mood in Spanish. Anyone have a good rule of thumb? Examples would be really helpful too.', 8, 7, 'resolved', ARRAY['spanish', 'subjunctive', 'grammar'], 189);

-- Insert sample responses
INSERT INTO responses (doubt_id, author_id, content, is_accepted) VALUES
(1, 2, 'Great question! For integration by parts, remember the acronym LIATE to choose u: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential. For ∫x*e^x dx:\n\n1. Choose u = x (algebraic), so du = dx\n2. Choose dv = e^x dx, so v = e^x\n3. Apply the formula: uv - ∫v du = x*e^x - ∫e^x dx = x*e^x - e^x + C = e^x(x-1) + C\n\nThe key is practice with the LIATE method!', true),
(1, 5, 'I struggled with this too! A helpful tip is to always choose u as the function that becomes simpler when differentiated. In this case, x becomes 1 when differentiated, which is much simpler.', false),
(2, 2, 'Think of quantum entanglement like this: imagine you have two magical coins. When you flip one and it lands heads, the other coin (no matter how far away) instantly lands tails. That''s essentially what happens with entangled particles - measuring one instantly affects the other, regardless of distance. It''s not that they''re sending signals, but rather they share a special connection that was created when they interacted.', true),
(3, 2, 'useEffect runs after the DOM has been painted to the screen, while useLayoutEffect runs synchronously after all DOM mutations but before the browser paints.\n\nUse useLayoutEffect when:\n- You need to read layout from the DOM and then make changes\n- You want to prevent visual flicker\n\nUse useEffect for:\n- Data fetching\n- Setting up subscriptions\n- Most other side effects\n\nExample: If you''re measuring element dimensions and updating styles, use useLayoutEffect to prevent flickering.', true),
(4, 3, 'Sure! Here''s the aufbau principle step by step:\n\n1. Fill orbitals in order of increasing energy: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p...\n2. Hund''s rule: Fill each orbital singly before pairing\n3. Pauli exclusion: Maximum 2 electrons per orbital\n\nFor example, Carbon (6 electrons): 1s² 2s² 2p²\nOr with noble gas notation: [He] 2s² 2p²\n\nThe key is memorizing the orbital energy diagram!', false),
(5, 7, 'Perfect tenses can be tricky! Here''s the difference:\n\nPresent Perfect: I have studied Spanish (completed action with present relevance)\nPresent Perfect Continuous: I have been studying Spanish (ongoing action started in past, continues now)\n\nUse perfect for completed actions, perfect continuous for ongoing actions that started in the past.', true),
(6, 4, 'The Spanish subjunctive is used to express doubt, emotion, desire, or hypothetical situations. Key triggers:\n\n- Doubt: "Dudo que venga" (I doubt he''s coming)\n- Emotion: "Me alegra que estés aquí" (I''m glad you''re here)\n- Desire: "Quiero que estudies" (I want you to study)\n\nIf it''s factual and certain, use indicative. If it''s subjective or uncertain, use subjunctive!', true);

-- Insert ratings
INSERT INTO ratings (user_id, doubt_id, rating_type) VALUES
(2, 1, 'upvote'), (4, 1, 'upvote'), (5, 1, 'upvote'), (6, 1, 'upvote'),
(2, 2, 'upvote'), (3, 2, 'upvote'), (5, 2, 'upvote'),
(3, 3, 'upvote'), (4, 3, 'upvote'), (6, 3, 'upvote'), (7, 3, 'upvote'),
(3, 4, 'upvote'), (5, 4, 'upvote'),
(2, 5, 'upvote'), (4, 5, 'upvote'), (6, 5, 'upvote'),
(2, 6, 'upvote'), (3, 6, 'upvote'), (5, 6, 'upvote');

INSERT INTO ratings (user_id, response_id, rating_type) VALUES
(3, 1, 'upvote'), (4, 1, 'upvote'), (5, 1, 'upvote'), (6, 1, 'upvote'),
(2, 2, 'upvote'), (4, 2, 'upvote'),
(3, 3, 'upvote'), (5, 3, 'upvote'), (6, 3, 'upvote'),
(2, 4, 'upvote'), (5, 4, 'upvote'),
(2, 5, 'upvote'), (4, 5, 'upvote'), (6, 5, 'upvote'),
(2, 6, 'upvote'), (3, 6, 'upvote'), (5, 6, 'upvote');

-- Mark some doubts as resolved and add to knowledge base
UPDATE doubts SET status = 'resolved', accepted_response_id = 1 WHERE id = 1;
UPDATE doubts SET accepted_response_id = 3 WHERE id = 2;
UPDATE doubts SET status = 'resolved', accepted_response_id = 5 WHERE id = 3;
UPDATE doubts SET accepted_response_id = 7 WHERE id = 5;
UPDATE doubts SET status = 'resolved', accepted_response_id = 9 WHERE id = 6;

-- Update responses as accepted
UPDATE responses SET is_accepted = true WHERE id IN (1, 3, 5, 7, 9);

-- Insert into knowledge base
INSERT INTO knowledge_base (doubt_id, title, summary, tags, category, difficulty_level, helpfulness_score, views_count) VALUES
(1, 'Integration by Parts - Step by Step Guide', 'Complete guide on solving integration by parts problems with the LIATE method and practical examples.', ARRAY['integration', 'calculus', 'mathematics'], 'Mathematics', 3, 4.8, 1250),
(3, 'React Hooks: useEffect vs useLayoutEffect', 'Practical differences between useEffect and useLayoutEffect with real-world examples and use cases.', ARRAY['react', 'hooks', 'javascript', 'frontend'], 'Programming', 2, 4.7, 890),
(6, 'Spanish Subjunctive Mood Usage Guide', 'Comprehensive guide on when and how to use the subjunctive mood in Spanish with examples and triggers.', ARRAY['spanish', 'grammar', 'subjunctive'], 'Languages', 4, 4.6, 450);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, related_doubt_id, related_response_id) VALUES
(3, 'Your doubt was answered!', 'Sarah Chen provided an answer to your question about integration by parts.', 'doubt_answered', 1, 1),
(3, 'Answer accepted!', 'Your answer about integration by parts was accepted by Rahul Sharma.', 'response_accepted', 1, 1),
(4, 'New upvote received', 'Someone upvoted your question about quantum entanglement.', 'upvote_received', 2, NULL),
(5, 'Answer accepted!', 'Your answer about React hooks was marked as the best answer.', 'response_accepted', 3, 5);

-- Update view counts based on interest
UPDATE doubts SET views_count = views_count + FLOOR(RANDOM() * 100) + 50;