--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

-- Started on 2025-11-23 23:18:07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 234 (class 1259 OID 76334)
-- Name: accesorio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accesorio (
    id integer NOT NULL,
    fk_id_carroceria integer NOT NULL,
    fk_id_tipo_accesorio integer NOT NULL,
    cantidad integer DEFAULT 1,
    marca character varying(100),
    modelo character varying(100)
);


ALTER TABLE public.accesorio OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 76333)
-- Name: accesorio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accesorio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accesorio_id_seq OWNER TO postgres;

--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 233
-- Name: accesorio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accesorio_id_seq OWNED BY public.accesorio.id;


--
-- TOC entry 230 (class 1259 OID 76309)
-- Name: calculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calculos (
    id integer NOT NULL,
    fk_id_pedido integer NOT NULL,
    resultado_peso_bruto_total_maximo numeric NOT NULL,
    resultado_carga_eje_delantero_calculada numeric NOT NULL,
    resultado_carga_eje_trasero_calculada numeric NOT NULL,
    resultado_porcentaje_carga_eje_delantero numeric(5,2) NOT NULL,
    resultado_modificacion_chasis character varying(255) NOT NULL,
    resultado_voladizo_trasero_calculado numeric NOT NULL,
    resultado_largo_final_camion numeric,
    verificacion_distribucion_carga_ok boolean NOT NULL,
    verificacion_voladizo_trasero_ok boolean NOT NULL,
    recomendaciones text[],
    resultado_desplazamiento_eje numeric,
    resultado_nueva_distancia_entre_ejes numeric,
    resultado_centro_carga_carroceria numeric,
    resultado_centro_carga_total numeric,
    resultado_carga_maxima_eje_delantero numeric,
    resultado_carga_maxima_eje_trasero numeric,
    resultado_carga_total_calculada numeric
);


ALTER TABLE public.calculos OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 76308)
-- Name: calculos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calculos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calculos_id_seq OWNER TO postgres;

--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 229
-- Name: calculos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calculos_id_seq OWNED BY public.calculos.id;


--
-- TOC entry 244 (class 1259 OID 76753)
-- Name: calculos_modificado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calculos_modificado (
    id integer NOT NULL,
    fk_proyecto_modificado_id integer,
    resultado_peso_bruto_total_maximo numeric,
    resultado_carga_maxima_eje_delantero numeric,
    resultado_carga_maxima_eje_trasero numeric,
    resultado_carga_total_calculada numeric,
    resultado_carga_eje_delantero_calculada numeric,
    resultado_carga_eje_trasero_calculada numeric,
    resultado_porcentaje_carga_eje_delantero numeric,
    resultado_modificacion_chasis character varying(100),
    resultado_voladizo_trasero_calculado numeric,
    resultado_largo_final_camion numeric,
    resultado_centro_carga_total numeric,
    resultado_centro_carga_carroceria numeric,
    resultado_nueva_distancia_entre_ejes numeric,
    resultado_desplazamiento_eje numeric,
    verificacion_distribucion_carga_ok boolean,
    verificacion_voladizo_trasero_ok boolean,
    recomendaciones text[]
);


ALTER TABLE public.calculos_modificado OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 76752)
-- Name: calculos_modificado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calculos_modificado_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calculos_modificado_id_seq OWNER TO postgres;

--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 243
-- Name: calculos_modificado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calculos_modificado_id_seq OWNED BY public.calculos_modificado.id;


--
-- TOC entry 222 (class 1259 OID 76243)
-- Name: camion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camion (
    id integer NOT NULL,
    marca_camion character varying(100) NOT NULL,
    modelo_camion character varying(100) NOT NULL,
    ano_camion character varying(10),
    estado_verificacion character varying(20) DEFAULT 'pendiente'::character varying,
    tipo_camion character varying(20)
);


ALTER TABLE public.camion OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 76276)
-- Name: camion_configuracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camion_configuracion (
    id integer NOT NULL,
    distancia_entre_ejes numeric NOT NULL,
    distancia_primer_eje_espalda_cabina numeric NOT NULL,
    voladizo_delantero numeric NOT NULL,
    voladizo_trasero numeric NOT NULL,
    peso_eje_delantero numeric NOT NULL,
    peso_eje_trasero numeric NOT NULL,
    pbt numeric NOT NULL,
    original boolean DEFAULT true,
    es_modificado boolean DEFAULT false,
    fk_id_camion integer
);


ALTER TABLE public.camion_configuracion OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 76275)
-- Name: camion_configuracion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.camion_configuracion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.camion_configuracion_id_seq OWNER TO postgres;

--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 225
-- Name: camion_configuracion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.camion_configuracion_id_seq OWNED BY public.camion_configuracion.id;


--
-- TOC entry 221 (class 1259 OID 76242)
-- Name: camion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.camion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.camion_id_seq OWNER TO postgres;

--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 221
-- Name: camion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.camion_id_seq OWNED BY public.camion.id;


--
-- TOC entry 238 (class 1259 OID 76713)
-- Name: camion_modificado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camion_modificado (
    id integer NOT NULL,
    fk_proyecto_modificado_id integer,
    marca_camion character varying(100),
    modelo_camion character varying(100),
    ano_camion character varying(10),
    tipo_camion character varying(10)
);


ALTER TABLE public.camion_modificado OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 76712)
-- Name: camion_modificado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.camion_modificado_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.camion_modificado_id_seq OWNER TO postgres;

--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 237
-- Name: camion_modificado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.camion_modificado_id_seq OWNED BY public.camion_modificado.id;


--
-- TOC entry 228 (class 1259 OID 76293)
-- Name: carroceria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carroceria (
    id integer NOT NULL,
    fk_id_pedido integer NOT NULL,
    tipo_carroceria character varying(50) NOT NULL,
    largo_carroceria numeric NOT NULL,
    alto_carroceria numeric NOT NULL,
    ancho_carroceria numeric NOT NULL,
    equipo_frio_marca_modelo character varying(255),
    observaciones text,
    separacion_cabina_carroceria integer
);


ALTER TABLE public.carroceria OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 76292)
-- Name: carroceria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carroceria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carroceria_id_seq OWNER TO postgres;

--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 227
-- Name: carroceria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carroceria_id_seq OWNED BY public.carroceria.id;


--
-- TOC entry 242 (class 1259 OID 76739)
-- Name: carroceria_modificada; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carroceria_modificada (
    id integer NOT NULL,
    fk_proyecto_modificado_id integer,
    tipo_carroceria character varying(50),
    largo_carroceria numeric,
    alto_carroceria numeric,
    ancho_carroceria numeric,
    separacion_cabina_carroceria numeric,
    equipo_frio_marca_modelo character varying(100)
);


ALTER TABLE public.carroceria_modificada OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 76738)
-- Name: carroceria_modificada_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carroceria_modificada_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carroceria_modificada_id_seq OWNER TO postgres;

--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 241
-- Name: carroceria_modificada_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carroceria_modificada_id_seq OWNED BY public.carroceria_modificada.id;


--
-- TOC entry 218 (class 1259 OID 76209)
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    cuit bigint NOT NULL,
    razon_social character varying(255) NOT NULL
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 76725)
-- Name: configuracion_modificada; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion_modificada (
    id integer NOT NULL,
    fk_proyecto_modificado_id integer,
    distancia_entre_ejes numeric,
    distancia_primer_eje_espalda_cabina numeric,
    voladizo_delantero numeric,
    voladizo_trasero numeric,
    peso_eje_delantero numeric,
    peso_eje_trasero numeric,
    pbt numeric
);


ALTER TABLE public.configuracion_modificada OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 76724)
-- Name: configuracion_modificada_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuracion_modificada_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuracion_modificada_id_seq OWNER TO postgres;

--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 239
-- Name: configuracion_modificada_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuracion_modificada_id_seq OWNED BY public.configuracion_modificada.id;


--
-- TOC entry 224 (class 1259 OID 76250)
-- Name: pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido (
    id integer NOT NULL,
    fk_id_camion integer NOT NULL,
    fk_cuit_cliente bigint NOT NULL,
    fk_id_vendedor integer NOT NULL,
    estado character varying(50) DEFAULT 'borrador'::character varying NOT NULL,
    fecha_pedido date DEFAULT CURRENT_DATE NOT NULL,
    fecha_entrega date,
    observaciones text
);


ALTER TABLE public.pedido OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 76249)
-- Name: pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedido_id_seq OWNER TO postgres;

--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 223
-- Name: pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_id_seq OWNED BY public.pedido.id;


--
-- TOC entry 236 (class 1259 OID 76702)
-- Name: proyecto_modificado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proyecto_modificado (
    id integer NOT NULL,
    fk_id_vendedor integer,
    fk_cuit_cliente numeric,
    cliente_razon_social character varying(255),
    estado_proyecto character varying(50) DEFAULT 'Guardado'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.proyecto_modificado OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 76701)
-- Name: proyecto_modificado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proyecto_modificado_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proyecto_modificado_id_seq OWNER TO postgres;

--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 235
-- Name: proyecto_modificado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proyecto_modificado_id_seq OWNED BY public.proyecto_modificado.id;


--
-- TOC entry 232 (class 1259 OID 76325)
-- Name: tipo_accesorio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_accesorio (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.tipo_accesorio OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 76324)
-- Name: tipo_accesorio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_accesorio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_accesorio_id_seq OWNER TO postgres;

--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 231
-- Name: tipo_accesorio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_accesorio_id_seq OWNED BY public.tipo_accesorio.id;


--
-- TOC entry 217 (class 1259 OID 76176)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    dni character varying(20) NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 76236)
-- Name: vendedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendedor (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL
);


ALTER TABLE public.vendedor OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 76235)
-- Name: vendedor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendedor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendedor_id_seq OWNER TO postgres;

--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 219
-- Name: vendedor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendedor_id_seq OWNED BY public.vendedor.id;


--
-- TOC entry 4824 (class 2604 OID 76337)
-- Name: accesorio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesorio ALTER COLUMN id SET DEFAULT nextval('public.accesorio_id_seq'::regclass);


--
-- TOC entry 4822 (class 2604 OID 76312)
-- Name: calculos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos ALTER COLUMN id SET DEFAULT nextval('public.calculos_id_seq'::regclass);


--
-- TOC entry 4832 (class 2604 OID 76756)
-- Name: calculos_modificado id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos_modificado ALTER COLUMN id SET DEFAULT nextval('public.calculos_modificado_id_seq'::regclass);


--
-- TOC entry 4813 (class 2604 OID 76246)
-- Name: camion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camion ALTER COLUMN id SET DEFAULT nextval('public.camion_id_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 76279)
-- Name: camion_configuracion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camion_configuracion ALTER COLUMN id SET DEFAULT nextval('public.camion_configuracion_id_seq'::regclass);


--
-- TOC entry 4829 (class 2604 OID 76716)
-- Name: camion_modificado id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camion_modificado ALTER COLUMN id SET DEFAULT nextval('public.camion_modificado_id_seq'::regclass);


--
-- TOC entry 4821 (class 2604 OID 76296)
-- Name: carroceria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carroceria ALTER COLUMN id SET DEFAULT nextval('public.carroceria_id_seq'::regclass);


--
-- TOC entry 4831 (class 2604 OID 76742)
-- Name: carroceria_modificada id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carroceria_modificada ALTER COLUMN id SET DEFAULT nextval('public.carroceria_modificada_id_seq'::regclass);


--
-- TOC entry 4830 (class 2604 OID 76728)
-- Name: configuracion_modificada id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_modificada ALTER COLUMN id SET DEFAULT nextval('public.configuracion_modificada_id_seq'::regclass);


--
-- TOC entry 4815 (class 2604 OID 76253)
-- Name: pedido id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido ALTER COLUMN id SET DEFAULT nextval('public.pedido_id_seq'::regclass);


--
-- TOC entry 4826 (class 2604 OID 76705)
-- Name: proyecto_modificado id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_modificado ALTER COLUMN id SET DEFAULT nextval('public.proyecto_modificado_id_seq'::regclass);


--
-- TOC entry 4823 (class 2604 OID 76328)
-- Name: tipo_accesorio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_accesorio ALTER COLUMN id SET DEFAULT nextval('public.tipo_accesorio_id_seq'::regclass);


--
-- TOC entry 4812 (class 2604 OID 76239)
-- Name: vendedor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendedor ALTER COLUMN id SET DEFAULT nextval('public.vendedor_id_seq'::regclass);


--
-- TOC entry 4862 (class 2606 OID 76340)
-- Name: accesorio accesorio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesorio
    ADD CONSTRAINT accesorio_pkey PRIMARY KEY (id);


--
-- TOC entry 4854 (class 2606 OID 76318)
-- Name: calculos calculos_fk_id_pedido_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos
    ADD CONSTRAINT calculos_fk_id_pedido_key UNIQUE (fk_id_pedido);


--
-- TOC entry 4872 (class 2606 OID 76760)
-- Name: calculos_modificado calculos_modificado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos_modificado
    ADD CONSTRAINT calculos_modificado_pkey PRIMARY KEY (id);


--
-- TOC entry 4856 (class 2606 OID 76316)
-- Name: calculos calculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos
    ADD CONSTRAINT calculos_pkey PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 76284)
-- Name: camion_configuracion camion_configuracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camion_configuracion
    ADD CONSTRAINT camion_configuracion_pkey PRIMARY KEY (id);


--
-- TOC entry 4866 (class 2606 OID 76718)
-- Name: camion_modificado camion_modificado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camion_modificado
    ADD CONSTRAINT camion_modificado_pkey PRIMARY KEY (id);


--
-- TOC entry 4842 (class 2606 OID 76248)
-- Name: camion camion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camion
    ADD CONSTRAINT camion_pkey PRIMARY KEY (id);


--
-- TOC entry 4850 (class 2606 OID 76302)
-- Name: carroceria carroceria_fk_id_pedido_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carroceria
    ADD CONSTRAINT carroceria_fk_id_pedido_key UNIQUE (fk_id_pedido);


--
-- TOC entry 4870 (class 2606 OID 76746)
-- Name: carroceria_modificada carroceria_modificada_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carroceria_modificada
    ADD CONSTRAINT carroceria_modificada_pkey PRIMARY KEY (id);


--
-- TOC entry 4852 (class 2606 OID 76300)
-- Name: carroceria carroceria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carroceria
    ADD CONSTRAINT carroceria_pkey PRIMARY KEY (id);


--
-- TOC entry 4838 (class 2606 OID 76213)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (cuit);


--
-- TOC entry 4868 (class 2606 OID 76732)
-- Name: configuracion_modificada configuracion_modificada_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_modificada
    ADD CONSTRAINT configuracion_modificada_pkey PRIMARY KEY (id);


--
-- TOC entry 4846 (class 2606 OID 76259)
-- Name: pedido pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_pkey PRIMARY KEY (id);


--
-- TOC entry 4864 (class 2606 OID 76711)
-- Name: proyecto_modificado proyecto_modificado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_modificado
    ADD CONSTRAINT proyecto_modificado_pkey PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 76332)
-- Name: tipo_accesorio tipo_accesorio_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_accesorio
    ADD CONSTRAINT tipo_accesorio_nombre_key UNIQUE (nombre);


--
-- TOC entry 4860 (class 2606 OID 76330)
-- Name: tipo_accesorio tipo_accesorio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_accesorio
    ADD CONSTRAINT tipo_accesorio_pkey PRIMARY KEY (id);


--
-- TOC entry 4844 (class 2606 OID 76570)
-- Name: camion uq_camion_marca_modelo_ano; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camion
    ADD CONSTRAINT uq_camion_marca_modelo_ano UNIQUE (marca_camion, modelo_camion, ano_camion);


--
-- TOC entry 4834 (class 2606 OID 76184)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4836 (class 2606 OID 76182)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (dni);


--
-- TOC entry 4840 (class 2606 OID 76241)
-- Name: vendedor vendedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendedor
    ADD CONSTRAINT vendedor_pkey PRIMARY KEY (id);


--
-- TOC entry 4879 (class 2606 OID 76341)
-- Name: accesorio accesorio_fk_id_carroceria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesorio
    ADD CONSTRAINT accesorio_fk_id_carroceria_fkey FOREIGN KEY (fk_id_carroceria) REFERENCES public.carroceria(id) ON DELETE CASCADE;


--
-- TOC entry 4880 (class 2606 OID 76346)
-- Name: accesorio accesorio_fk_id_tipo_accesorio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesorio
    ADD CONSTRAINT accesorio_fk_id_tipo_accesorio_fkey FOREIGN KEY (fk_id_tipo_accesorio) REFERENCES public.tipo_accesorio(id);


--
-- TOC entry 4878 (class 2606 OID 76319)
-- Name: calculos calculos_fk_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos
    ADD CONSTRAINT calculos_fk_id_pedido_fkey FOREIGN KEY (fk_id_pedido) REFERENCES public.pedido(id) ON DELETE CASCADE;


--
-- TOC entry 4884 (class 2606 OID 76761)
-- Name: calculos_modificado calculos_modificado_fk_proyecto_modificado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos_modificado
    ADD CONSTRAINT calculos_modificado_fk_proyecto_modificado_id_fkey FOREIGN KEY (fk_proyecto_modificado_id) REFERENCES public.proyecto_modificado(id) ON DELETE CASCADE;


--
-- TOC entry 4881 (class 2606 OID 76719)
-- Name: camion_modificado camion_modificado_fk_proyecto_modificado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camion_modificado
    ADD CONSTRAINT camion_modificado_fk_proyecto_modificado_id_fkey FOREIGN KEY (fk_proyecto_modificado_id) REFERENCES public.proyecto_modificado(id) ON DELETE CASCADE;


--
-- TOC entry 4877 (class 2606 OID 76303)
-- Name: carroceria carroceria_fk_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carroceria
    ADD CONSTRAINT carroceria_fk_id_pedido_fkey FOREIGN KEY (fk_id_pedido) REFERENCES public.pedido(id) ON DELETE CASCADE;


--
-- TOC entry 4883 (class 2606 OID 76747)
-- Name: carroceria_modificada carroceria_modificada_fk_proyecto_modificado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carroceria_modificada
    ADD CONSTRAINT carroceria_modificada_fk_proyecto_modificado_id_fkey FOREIGN KEY (fk_proyecto_modificado_id) REFERENCES public.proyecto_modificado(id) ON DELETE CASCADE;


--
-- TOC entry 4882 (class 2606 OID 76733)
-- Name: configuracion_modificada configuracion_modificada_fk_proyecto_modificado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_modificada
    ADD CONSTRAINT configuracion_modificada_fk_proyecto_modificado_id_fkey FOREIGN KEY (fk_proyecto_modificado_id) REFERENCES public.proyecto_modificado(id) ON DELETE CASCADE;


--
-- TOC entry 4876 (class 2606 OID 76768)
-- Name: camion_configuracion fk_config_camion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camion_configuracion
    ADD CONSTRAINT fk_config_camion FOREIGN KEY (fk_id_camion) REFERENCES public.camion(id);


--
-- TOC entry 4873 (class 2606 OID 76265)
-- Name: pedido pedido_fk_cuit_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_fk_cuit_cliente_fkey FOREIGN KEY (fk_cuit_cliente) REFERENCES public.cliente(cuit) ON DELETE RESTRICT;


--
-- TOC entry 4874 (class 2606 OID 76260)
-- Name: pedido pedido_fk_id_camion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_fk_id_camion_fkey FOREIGN KEY (fk_id_camion) REFERENCES public.camion(id) ON DELETE RESTRICT;


--
-- TOC entry 4875 (class 2606 OID 76270)
-- Name: pedido pedido_fk_id_vendedor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_fk_id_vendedor_fkey FOREIGN KEY (fk_id_vendedor) REFERENCES public.vendedor(id) ON DELETE RESTRICT;


-- Completed on 2025-11-23 23:18:07

--
-- PostgreSQL database dump complete
--

