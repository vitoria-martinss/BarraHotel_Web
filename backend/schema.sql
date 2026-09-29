CREATE DATABASE IF NOT EXISTS hotel CHARACTER SET utf8mb4;
USE hotel;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE,
  senha_hash VARCHAR(255) DEFAULT NULL, -- NULL = hóspede cadastrado pela recepção, sem login próprio
  documento VARCHAR(30),
  telefone VARCHAR(30),
  papel ENUM('hospede','recepcionista','admin') NOT NULL DEFAULT 'hospede',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tipos_quarto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  descricao TEXT,
  preco_diaria DECIMAL(10,2) NOT NULL,
  capacidade_pessoas INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE imagens_tipo_quarto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_id INT NOT NULL,
  caminho_arquivo VARCHAR(255) NOT NULL,
  FOREIGN KEY (tipo_id) REFERENCES tipos_quarto(id) ON DELETE CASCADE
);

-- Quartos físicos (números reais do hotel), cada um pertence a um tipo
CREATE TABLE quartos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_id INT NOT NULL,
  numero VARCHAR(10) NOT NULL UNIQUE,
  FOREIGN KEY (tipo_id) REFERENCES tipos_quarto(id)
);

CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quarto_id INT NOT NULL,
  hospede_id INT NOT NULL,
  criado_por_id INT DEFAULT NULL, -- preenchido quando um funcionário cria a reserva
  data_checkin DATE NOT NULL,
  data_checkout DATE NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  status ENUM('confirmada','cancelada','concluida') NOT NULL DEFAULT 'confirmada',
  pago BOOLEAN NOT NULL DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quarto_id) REFERENCES quartos(id),
  FOREIGN KEY (hospede_id) REFERENCES usuarios(id),
  FOREIGN KEY (criado_por_id) REFERENCES usuarios(id)
);

-- Dados de exemplo
INSERT INTO tipos_quarto (nome, descricao, preco_diaria, capacidade_pessoas) VALUES
('Standard', 'Quarto confortável com cama de casal, ideal para casais ou viajantes solo.', 220.00, 2),
('Luxo', 'Quarto amplo com varanda e vista para o jardim, cama king size.', 380.00, 2),
('Família', 'Suíte espaçosa com duas camas de casal, perfeita para famílias.', 520.00, 4);

INSERT INTO quartos (tipo_id, numero) VALUES
(1, '101'), (1, '102'), (1, '103'),
(2, '201'), (2, '202'),
(3, '301'), (3, '302');
