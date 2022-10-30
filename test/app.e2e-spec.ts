import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Testes dos Módulos Usuário e Auth (e2e)', () => {
  
  let app: INestApplication;
  let token: any;
  let usuarioId: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'db_blogpessoal_test',
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
        dropSchema: true
      }),
      AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('01 - Deve Cadastrar Usuario', async () => {
    const resposta = await request(app.getHttpServer())
    .post('/usuarios/cadastrar')
    .send({
      nome: 'Root',
      usuario: 'root@root.com',
      senha: 'rootroot',
      foto: 'root.jpg'
    });
    expect(201)
    usuarioId = resposta.body.id;
  });

  it('02 - Deve Autenticar Usuario (Login)', async () => {
    const resposta = await request(app.getHttpServer())
    .post('/auth/logar')
    .send({
      usuario: 'root@root.com',
      senha: 'rootroot',
    });
    expect(200)

    token = resposta.body.token;

  });

  it('03 - Não Deve Duplicar o Usuário', async () => {
    return request(app.getHttpServer())
    .post('/usuarios/cadastrar')
    .send({
      nome: 'Root',
      usuario: 'root@root.com',
      senha: 'rootroot',
      foto: 'root.jpg'
    })
    .expect(400)
  });

  it('04 - Deve Listar todos os Usuários', async () => {
    return request(app.getHttpServer())
      .get('/usuarios/all')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200)
  });

  it('05 - Deve Atualizar um Usuário', async () => {
    return request(app.getHttpServer())
      .put('/usuarios/atualizar')
      .set('Authorization', `${token}`)
      .send({
        id: usuarioId,
        nome: 'Root Atualizado',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: ' '
      })
      .expect(200)
      .then(resposta =>{
        expect("Root Atualizado").toEqual(resposta.body.nome);
      });
  });

  it('06 - Deve Criar Um Tema', async () => {
    return request(app.getHttpServer())
    .post('/tema')
    .set('Authorization', `${token}`)
    .send({
      descricao: 'Tema teste'
    })
    .expect(201)
  });

  it('07 - Deve Criar Uma Postagem', async () => {
    return request(app.getHttpServer())
    .post('/postagens')
    .set('Authorization', `${token}`)
    .send({
      titulo: 'Postagem teste',
      texto: 'Esta é uma postagem teste',
      tema: 1,
      usuario: 1
    })
    .expect(201)
  });

  it('08 - Deve Atualizar Um Tema', async () => {
    return request(app.getHttpServer())
    .put('/tema')
    .set('Authorization', `${token}`)
    .send({
      id: 1,
      descricao: 'Tema Teste Atualizado'
    })
    .expect(200)
    .then(resposta =>{
      expect("Tema Teste Atualizado").toEqual(resposta.body.descricao);
    });
  });

  it('09 - Deve Atualizar Uma Postagem', async () => {
    return request(app.getHttpServer())
    .put('/postagens')
    .set('Authorization', `${token}`)
    .send({
      id: 1,
      titulo: 'Postagem teste Atualizado',
      texto: 'Esta é uma postagem teste',
    })
    .expect(200)
    .then(resposta =>{
      expect("Postagem teste Atualizado").toEqual(resposta.body.titulo);
    });
  });

  it('10 - Deve Listar todos os Temas', async () => {
    return request(app.getHttpServer())
      .get('/tema')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200)
  });

  it('11 - Deve Mostrar Tema pelo Id', async () => {
    return request(app.getHttpServer())
      .get('/tema/1')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200)
  });

  it('12 - Deve Mostrar Tema pela Descriçao', async () => {
    return request(app.getHttpServer())
      .get('/tema/descricao/Tema_Teste')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200)
  });

  it('13 - Deve Listar todos as Postagens', async () => {
    return request(app.getHttpServer())
      .get('/postagens')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200)
  });

  it('14 - Deve Mostrar Postagem pelo Id', async () => {
    return request(app.getHttpServer())
      .get('/postagens/1')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200)
  });

  it('15 - Deve Mostrar Postagem pelo Titulo', async () => {
    return request(app.getHttpServer())
      .get('/postagens/titulo/Postagem_teste')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200)
  });

  it('16 - Deve Deletar Postagem', async () => {
    return request(app.getHttpServer())
    .delete('/postagens/1')
    .set('Authorization', `${token}`)
    .send({})
    .expect(204)
  });

  it('17 - Deve Deletar Tema', async () => {
    return request(app.getHttpServer())
    .delete('/tema/1')
    .set('Authorization', `${token}`)
    .send({})
    .expect(204)
  });

});
