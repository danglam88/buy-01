def predefinedEmails = 'dang.lam@gritlab.ax huong.le@gritlab.ax iuliia.chipsanova@gritlab.ax nafisah.rantasalmi@gritlab.ax'

pipeline {
    agent any // We define the specific agents within each stage

    options {
        timestamps()  // Add timestamps to console output
        timeout(time: 30, unit: 'MINUTES')  // Set a timeout of 30 minutes for the entire pipeline
    }

    environment {
        DOCKER_USER_MICROSERVICE_IMAGE = "danglamgritlab/user-microservice:latest"
        DOCKER_PRODUCT_MICROSERVICE_IMAGE = "danglamgritlab/product-microservice:latest"
        DOCKER_MEDIA_MICROSERVICE_IMAGE = "danglamgritlab/media-microservice:latest"
        DOCKER_FRONTEND_IMAGE = "danglamgritlab/frontend:latest"
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
                    docker tag user-microservice ${env.DOCKER_USER_MICROSERVICE_IMAGE}
                    docker push ${env.DOCKER_USER_MICROSERVICE_IMAGE}

                    docker build -t product-microservice -f product/Dockerfile .
                    docker tag product-microservice ${env.DOCKER_PRODUCT_MICROSERVICE_IMAGE}
                    docker push ${env.DOCKER_PRODUCT_MICROSERVICE_IMAGE}

                    docker build -t media-microservice -f media/Dockerfile .
                    docker tag media-microservice ${env.DOCKER_MEDIA_MICROSERVICE_IMAGE}
                    docker push ${env.DOCKER_MEDIA_MICROSERVICE_IMAGE}

                    cd ../frontend
                    docker build -t frontend .
                    docker tag frontend ${env.DOCKER_FRONTEND_IMAGE}
                    docker push ${env.DOCKER_FRONTEND_IMAGE}

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

                    docker pull ${env.DOCKER_USER_MICROSERVICE_IMAGE}
                    docker pull ${env.DOCKER_PRODUCT_MICROSERVICE_IMAGE}
                    docker pull ${env.DOCKER_MEDIA_MICROSERVICE_IMAGE}
                    docker pull ${env.DOCKER_FRONTEND_IMAGE}

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
                docker save -o ~/user-microservice.tar ${env.DOCKER_USER_MICROSERVICE_IMAGE}
                docker save -o ~/product-microservice.tar ${env.DOCKER_PRODUCT_MICROSERVICE_IMAGE}
                docker save -o ~/media-microservice.tar ${env.DOCKER_MEDIA_MICROSERVICE_IMAGE}
                docker save -o ~/frontend.tar ${env.DOCKER_FRONTEND_IMAGE}

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

                docker load -i ~/user-microservice.tar
                docker load -i ~/product-microservice.tar
                docker load -i ~/media-microservice.tar
                docker load -i ~/frontend.tar

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
