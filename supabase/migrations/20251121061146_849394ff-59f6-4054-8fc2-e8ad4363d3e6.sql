-- Seed initial content for Give page
INSERT INTO public.page_content (page_name, section_name, content, content_type, is_published) VALUES
-- Hero Section
('give', 'hero_title', 'Partner With Us In Building God''s Kingdom', 'text', true),
('give', 'hero_subtitle', 'Every seed you sow makes an eternal difference. Your faithful giving enables us to fulfill our mission of raising champions for Christ and advancing the gospel across East Africa and beyond.', 'text', true),
('give', 'hero_stat_1_value', '$10,600', 'text', true),
('give', 'hero_stat_1_label', 'Monthly Giving', 'text', true),
('give', 'hero_stat_2_value', '450+', 'text', true),
('give', 'hero_stat_2_label', 'Monthly Partners', 'text', true),
('give', 'hero_stat_3_value', '95%', 'text', true),
('give', 'hero_stat_3_label', 'Ministry Impact', 'text', true),

-- Impact Allocation
('give', 'impact_missions_percentage', '35%', 'text', true),
('give', 'impact_missions_title', 'MISSIONS', 'text', true),
('give', 'impact_missions_description', 'Global missions & church planting', 'text', true),
('give', 'impact_ministry_percentage', '30%', 'text', true),
('give', 'impact_ministry_title', 'MINISTRY', 'text', true),
('give', 'impact_ministry_description', 'Life-changing programs & events', 'text', true),
('give', 'impact_community_percentage', '20%', 'text', true),
('give', 'impact_community_title', 'COMMUNITY', 'text', true),
('give', 'impact_community_description', 'Outreach & feeding initiatives', 'text', true),
('give', 'impact_operations_percentage', '15%', 'text', true),
('give', 'impact_operations_title', 'OPERATIONS', 'text', true),
('give', 'impact_operations_description', 'Facilities & staff support', 'text', true),

-- Scripture Section
('give', 'scripture_verse', '"Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap. For with the measure you use, it will be measured to you."', 'text', true),
('give', 'scripture_reference', 'Luke 6:38', 'text', true),

-- FAQ Section
('give', 'faq_1_question', 'Is my donation secure?', 'text', true),
('give', 'faq_1_answer', 'Yes! We use industry-leading encryption and Paystack payment processing to ensure your information is completely secure.', 'text', true),
('give', 'faq_2_question', 'Can I set up recurring giving?', 'text', true),
('give', 'faq_2_answer', 'Absolutely! You can set up automatic monthly giving through your dashboard to make consistent kingdom impact.', 'text', true),
('give', 'faq_3_question', 'Will I receive a receipt?', 'text', true),
('give', 'faq_3_answer', 'Yes, you''ll receive an instant email receipt for all donations. You can also download detailed giving reports from your dashboard.', 'text', true),
('give', 'faq_4_question', 'What payment methods do you accept?', 'text', true),
('give', 'faq_4_answer', 'We accept M-Pesa mobile money and all major credit/debit cards through our secure payment processor.', 'text', true),

-- Footer CTA
('give', 'footer_cta_title', 'Ready to Make a Difference?', 'text', true),
('give', 'footer_cta_description', 'Join hundreds of faithful partners who are advancing God''s kingdom through their generous giving. Your contribution today transforms lives tomorrow.', 'text', true)
ON CONFLICT DO NOTHING;
