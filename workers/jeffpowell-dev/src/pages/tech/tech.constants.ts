import { TechNode, TechColorPalette } from './tech.types';

export const KNOWN_TECH: TechNode = {
  name: 'Known Tech',
  children: [
    {
      name: 'Language',
      children: [
        { name: 'Python', value: 2 },
        { name: 'Java', value: 3 },
        { name: 'Clojure', value: 1 },
        { name: 'HTML5', value: 3 },
        { name: 'CSS4', value: 3 },
        { name: 'Javascript', value: 3 },
        { name: 'SVG', value: 2 },
        { name: 'Kotlin', value: 1 }
      ]
    },
    {
      name: 'Spec& Notation Syntax',
      children: [
        { name: 'JSON', value: 3 },
        { name: 'YAML', value: 3 },
        { name: 'Terraform', value: 2 },
        { name: 'Markdown', value: 3 },
        { name: 'TOML', value: 1 }
      ]
    },
    {
      name: 'Browser',
      children: [
        { name: 'Firefox', value: 3 },
        { name: 'Edge', value: 2 },
        { name: 'Chrome', value: 2 }
      ]
    },
    {
      name: 'Network Protocol',
      children: [
        { name: 'HTTP/1', value: 3 },
        { name: 'AJAX', value: 3 },
        { name: 'REST', value: 3 },
        { name: 'Websocket', value: 3 },
        { name: 'AMQP', value: 2 },
        { name: 'DNS', value: 2 },
        { name: 'Firewall', value: 2 },
        { name: 'Tailscale', value: 2 }
      ]
    },
    {
      name: 'Logging & Telemetry',
      children: [
        { name: 'Kibana', value: 3 },
        { name: 'OpenSearch', value: 3 },
        { name: 'Slf4j', value: 3 },
        { name: 'Graphite', value: 2 },
        { name: 'Grafana', value: 3 },
        { name: 'Eclipse Memory Analyzer', value: 2 },
        { name: 'JVisualVM', value: 2 },
        { name: 'Fullstory', value: 2 }
      ]
    },
    {
      name: 'Testing',
      children: [
        { name: 'JUnit5', value: 3 },
        { name: 'Jasmine', value: 3 },
        { name: 'Karma', value: 2 },
        { name: 'Mockito', value: 3 },
        { name: 'JMeter', value: 2 },
        { name: 'Cypress', value: 2 },
        { name: 'Responsive design', value: 3 }
      ]
    },
    {
      name: 'Injection',
      children: [
        { name: 'HK2', value: 3 },
        { name: 'Guice', value: 2 },
        { name: 'Dagger2', value: 1 },
        { name: 'Angular DI', value: 2 }
      ]
    },
    {
      name: 'Dependency Management',
      children: [
        { name: 'Maven', value: 3 },
        { name: 'Gradle', value: 1 },
        { name: 'NPM', value: 3 },
        { name: 'Pip', value: 2 },
        { name: 'PNPM', value: 2 }
      ]
    },
    {
      name: 'Database & Caching',
      children: [
        { name: 'MongoDB', value: 1 },
        { name: 'SQL Server', value: 3 },
        { name: 'MySQL', value: 2 },
        { name: 'Memcached', value: 2 },
        { name: 'Redis', value: 2 },
        { name: 'Postgres', value: 2 },
        { name: 'S3', value: 2 },
        { name: 'R2', value: 2 },
        { name: 'DynamoDB', value: 2 }
      ]
    },
    {
      name: 'Web Framework',
      children: [
        { name: 'Angular', value: 2 },
        { name: 'React', value: 1 },
        { name: 'HTMX', value: 2 },
        { name: 'TailwindCSS', value: 3 },
        { name: 'SCSS', value: 3 },
        { name: 'LESS', value: 3 }
      ]
    },
    {
      name: 'Operating System',
      children: [
        { name: 'Windows', value: 3 },
        { name: 'Linux', value: 2 },
        { name: 'Proxmox', value: 2 }
      ]
    },
    {
      name: 'IDE',
      children: [
        { name: 'Netbeans', value: 2 },
        { name: 'Visual Studio Code', value: 3 },
        { name: 'IntelliJ', value: 1 },
        { name: 'Windsurf', value: 3 }
      ]
    },
    {
      name: 'CI/CD',
      children: [
        { name: 'Artifactory', value: 2 },
        { name: 'Jenkins/ Cloudbees', value: 2 },
        { name: 'Docker + Compose', value: 3 },
        { name: 'SonarQube', value: 3 },
        { name: 'Github Actions', value: 2 },
        { name: 'Gitlab Actions', value: 2 },
        { name: 'Cloudflare Builds', value: 2 }
      ]
    },
    {
      name: 'Public Cloud',
      children: [
        { name: 'Amazon AWS', value: 2 },
        { name: 'Cloudflare', value: 3 },
        { name: 'Azure', value: 1 }
      ]
    },
    {
      name: 'SCM',
      children: [
        { name: 'Git', value: 3 },
        { name: 'SVN', value: 2 }
      ]
    },
    {
      name: 'Web Server',
      children: [
        { name: 'Nginx', value: 3 },
        { name: 'Apache', value: 1 },
        { name: 'Tomcat', value: 2 },
        { name: 'Traefik', value: 2 }
      ]
    },
    {
      name: 'Home Lab',
      children: [
        { name: 'Hardware procurement', value: 3 },
        { name: 'Networking', value: 2 },
        { name: 'Custom PC assembly', value: 3 },
        { name: 'Custom patch cable', value: 3 },
        { name: '3-2-1 Backups', value: 3 },
        { name: 'SSL& Reverse proxy', value: 2 }
      ]
    }
  ]
};

export const COLORS: TechColorPalette = {
  light: 'oklch(0.8976 0.0785 134.47)',
  medium: 'oklch(0.77 0.148 134.47)',
  'dark-border': '#3f6212'
};
