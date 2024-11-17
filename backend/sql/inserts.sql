INSERT INTO questions_types (type_name,type_description,created_at,updated_at) VALUES
	 ('Múltipla escolha (RM)','Múltipla escolha (RM)',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
	 ('Dicotômica','Dicotômica',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
	 ('Resposta única (RU)','Resposta única (RU)',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
	 ('Pergunta tipo matriz','Pergunta tipo matriz',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
	 ('Ranking','Ranking',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
	 ('Pergunta de resposta aberta','Pergunta de resposta aberta',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);


INSERT INTO questions (type_id, question_number, question_content, is_optional, is_active, created_at, updated_at)
VALUES
    (6, 1, 'Qual o motivo pelo qual você está procurando adotar um pet?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 2, 'Mora em casa ou apartamento? É permitido animais no imóvel?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 3, 'Já tem um local preparado para o pet dormir? Como é o local?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 4, 'Já possui outros pets? São castrados e vacinados?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 5, 'Como irá educá-lo? O que fará quando o pet não se comportar conforme o esperado?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 6, 'Tem certeza que pode arcar com os custos de alimentação, vermifugação, vacinação, castração, assistência veterinária?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 7, 'Quando for viajar o que pretende fazer com o pet? Já tem um plano?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 8, 'Alguém da família tem alergia a pêlos? O que faria se descobrir que alguém da família tem alergia?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 9, 'Todas as pessoas que moram na casa estão cientes e de acordo com a adoção?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 10, 'Tem ciência que esse animal pode crescer, envelhecer, ficar doente, e que você é responsável por prover alimentação, lar, companhia, até o fim da vida dele?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 11, 'Tem ciência que maus-tratos contra animais podem ser punidos com reclusão, multa e proibição da guarda? O que pensa sobre isso?', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


INSERT INTO users (name,email,phone_number,login,"password","type",is_active,is_admin,image,created_at,updated_at) VALUES
	 ('Wellington','weloliver@yahoo.com.br','16 99999-8888','admin','$2a$10$atu3JBzbuzqLhxxEigMPfeVGnK.pp1i/4E2igwv3j28TyE7Q8wDqS','ambos',true,true,'admin.png',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);


INSERT INTO pets (pet_name, state, city, description, species, gender, breed, age, size, colour, personality, special_care, vaccinated, castrated, vermifuged, is_adopted, created_at, updated_at) VALUES
('Steve Jobson', 'SP', 'Franca', 'Esse amiguinho quer muito te acompanhar nas suas aventuras.', 'cachorro', 'macho', 'Basset', 5, 'pequeno', 'Preto', 'Dócil e animado', '', true, true, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Marco Zuckerdog', 'SP', 'Franca', 'Companheiro fiel e protetor da família.', 'cachorro', 'macho', 'Bulldog', 6, 'medio', 'Bege e branco', 'Companheiro e amigável', 'Deficiências de Locomoção', true, true, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bill Cattes', 'SP', 'Franca', 'Esse bichano é esperto, calmo e carinhoso. Ideal para casas ou apartamentos pequenos.', 'gato', 'macho', 'Shorthair', 4, 'pequeno', 'Malhado cinza', 'Esperto e carinhoso', '', true, false, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


INSERT INTO donations (user_id, pet_id, donation_date) VALUES
(1, 1, CURRENT_TIMESTAMP),
(1, 2, CURRENT_TIMESTAMP),
(1, 3, CURRENT_TIMESTAMP);


INSERT INTO pet_images (pet_id, image, created_at) VALUES
(1, '1_1_20240523100923.jpg', CURRENT_TIMESTAMP),
(2, '2_2_20240523101300.jpg', CURRENT_TIMESTAMP),
(3, '3_3_20240523101420.jpg', CURRENT_TIMESTAMP);