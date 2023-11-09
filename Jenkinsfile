def predefinedEmails = 'dang.lam@gritlab.ax huong.le@gritlab.ax iuliia.chipsanova@gritlab.ax nafisah.rantasalmi@gritlab.ax'

pipeline {
    agent any // We define the specific agents within each stage

    options {
        timestamps()  // Add timestamps to console output
        timeout(time: 30, unit: 'MINUTES')  // Set a timeout of 30 minutes for the entire pipeline
    }

    stages {
        stage('Unit Tests') {
            parallel {
                stage('Frontend Tests') {
                    agent { label 'build-agent' } // This stage will be executed on the 'build' agent
                    steps {
                        script {
                            env.PATH = "/home/danglam/.nvm/versions/node/v18.10.0/bin:${env.PATH}"
                        }
                        sh '''
                        cd frontend
                        echo $PATH
                        npm install
                        ng test --watch=false --browsers ChromeHeadless
                        '''
                    }
                }
                stage('Media-Microservice Tests') {
                    agent { label 'build-agent' } // This stage will be executed on the 'build' agent
                    steps {
                        sh '''
                        cd backend/media
                        mvn test
                        '''
                    }
                }
                stage('Product-Microservice Tests') {
                    agent { label 'build-agent' } // This stage will be executed on the 'build' agent
                    steps {
                        sh '''
                        cd backend/product
                        mvn test
                        '''
                    }
                }
                stage('User-Microservice Tests') {
                    agent { label 'build-agent' } // This stage will be executed on the 'build' agent
                    steps {
                        sh '''
                        cd backend/user
                        mvn test
                        '''
                    }
                }
            }
        }

        stage('Build') {
            agent { label 'build-agent' } // This stage will be executed on the 'build' agent
            steps {
                script {
                    // Execute the build commands
                    sh '''
                    docker volume ls
                    docker system prune -a -f

                    cd backend

                    docker build -t user-microservice -f user/Dockerfile .
                    docker tag user-microservice danglamgritlab/user-microservice:latest
                    docker push danglamgritlab/user-microservice:latest

                    docker build -t product-microservice -f product/Dockerfile .
                    docker tag product-microservice danglamgritlab/product-microservice:latest
                    docker push danglamgritlab/product-microservice:latest

                    docker build -t media-microservice -f media/Dockerfile .
                    docker tag media-microservice danglamgritlab/media-microservice:latest
                    docker push danglamgritlab/media-microservice:latest

                    cd ../frontend
                    docker build -t frontend .
                    docker tag frontend danglamgritlab/frontend:latest
                    docker push danglamgritlab/frontend:latest

                    docker system prune -a -f
                    docker volume ls
                    '''
                }
            }
        }
        
        stage('Deploy') {
            agent { label 'deploy-agent' } // This stage will be executed on the 'deploy' agent
            steps {
                script {
                    // Execute the deploy commands
                    sh '''
                    docker volume ls
                    if [ "$(docker ps -aq)" != "" ]; then
                        docker rm -f $(docker ps -aq)
                    fi
                    docker system prune -a -f

                    docker pull danglamgritlab/user-microservice:latest
                    docker pull danglamgritlab/product-microservice:latest
                    docker pull danglamgritlab/media-microservice:latest
                    docker pull danglamgritlab/frontend:latest

                    docker-compose up -d

                    if [ "$(docker ps -q | wc -l)" != "9" ]; then
                        exit 1
                    fi
                    docker volume ls
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "The pipeline has completed execution."
        }

        success {
            script {
                // If deploy succeeds, the backup commands are executed
                echo "Deployment succeeded. Executing backup."
                sh '''
                docker volume ls
                docker save -o /tmp/user-microservice.tar danglamgritlab/user-microservice
                docker save -o /tmp/product-microservice.tar danglamgritlab/product-microservice
                docker save -o /tmp/media-microservice.tar danglamgritlab/media-microservice
                docker save -o /tmp/frontend.tar danglamgritlab/frontend

                docker volume ls
                '''

                mail to: "${predefinedEmails}",
                        subject: "Jenkins Pipeline SUCCESS: ${currentBuild.fullDisplayName}",
                        body: """Hello,

The Jenkins Pipeline ${currentBuild.fullDisplayName} has succeeded.

See full details at: ${env.BUILD_URL}

Best regards,
Gritlab Jenkins
"""
            }
        }

        failure {
            script {
                // If deploy fails, the rollback commands are executed
                echo "Deployment failed. Executing rollback."
                sh '''
                docker volume ls
                if [ "$(docker ps -aq)" != "" ]; then
                    docker rm -f $(docker ps -aq)
                fi
                docker system prune -a -f

                docker load -i /tmp/user-microservice.tar
                docker load -i /tmp/product-microservice.tar
                docker load -i /tmp/media-microservice.tar
                docker load -i /tmp/frontend.tar

                docker-compose up -d
                docker volume ls
                '''

                def culprits = currentBuild.changeSets.collectMany { changeSet ->
                    changeSet.items.collect { it.author.fullName }
                }.join(', ')
        
                def recipient = culprits ? "${culprits}, ${predefinedEmails}" : predefinedEmails
        
                mail to: recipient,
                    subject: "Jenkins Pipeline FAILURE: ${currentBuild.fullDisplayName}",
                    body: """Hello,

The Jenkins Pipeline ${currentBuild.fullDisplayName} has failed.

See full details at: ${env.BUILD_URL}

Best regards,
Gritlab Jenkins
"""
            }
        }
    }
}
