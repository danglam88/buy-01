def predefinedEmails = 'dang.lam@gritlab.ax huong.le@gritlab.ax iuliia.chipsanova@gritlab.ax nafisah.rantasalmi@gritlab.ax'

pipeline {
    agent any // We define the specific agents within each stage

    options {
        timestamps()  // Add timestamps to console output
        timeout(time: 30, unit: 'MINUTES')  // Set a timeout of 30 minutes for the entire pipeline
    }

    environment {
        USER_MICROSERVICE_IMAGE = 'danglamgritlab/user-microservice:latest'
        PRODUCT_MICROSERVICE_IMAGE = 'danglamgritlab/product-microservice:latest'
        MEDIA_MICROSERVICE_IMAGE = 'danglamgritlab/media-microservice:latest'
        FRONTEND_IMAGE = 'danglamgritlab/frontend:latest'
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
                    docker system prune -a -f

                    cd backend

                    docker build -t user-microservice -f user/Dockerfile .
                    docker tag user-microservice $USER_MICROSERVICE_IMAGE
                    docker push $USER_MICROSERVICE_IMAGE

                    docker build -t product-microservice -f product/Dockerfile .
                    docker tag product-microservice $PRODUCT_MICROSERVICE_IMAGE
                    docker push $PRODUCT_MICROSERVICE_IMAGE

                    docker build -t media-microservice -f media/Dockerfile .
                    docker tag media-microservice $MEDIA_MICROSERVICE_IMAGE
                    docker push $MEDIA_MICROSERVICE_IMAGE

                    cd ../frontend
                    docker build -t frontend .
                    docker tag frontend $FRONTEND_IMAGE
                    docker push $FRONTEND_IMAGE

                    docker system prune -a -f
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
                    if [ "$(docker ps -aq)" != "" ]; then
                        docker rm -f $(docker ps -aq)
                    fi
                    docker system prune -a -f

                    rm -rf ~/*.tar

                    echo "Testing images before pull"
                    docker images

                    docker pull $USER_MICROSERVICE_IMAGE
                    docker pull $PRODUCT_MICROSERVICE_IMAGE
                    docker pull $MEDIA_MICROSERVICE_IMAGE
                    docker pull $FRONTEND_IMAGE

                    echo "Testing images after pull"
                    docker images

                    docker-compose up -d

                    if [ "$(docker ps -q | wc -l)" != "9" ]; then
                        exit 1
                    fi
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
                docker save -o ~/user-microservice.tar $USER_MICROSERVICE_IMAGE
                docker save -o ~/product-microservice.tar $PRODUCT_MICROSERVICE_IMAGE
                docker save -o ~/media-microservice.tar $MEDIA_MICROSERVICE_IMAGE
                docker save -o ~/frontend.tar $FRONTEND_IMAGE

                if [ ! -d "~/backup" ]; then
                    mkdir -p ~/backup
                fi

                mv ~/*.tar ~/backup/
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
                if [ "$(docker ps -aq)" != "" ]; then
                    docker rm -f $(docker ps -aq)
                fi
                docker system prune -a -f

                rm -rf ~/*.tar
                cp ~/backup/*.tar ~/

                docker load -i ~/user-microservice.tar
                docker load -i ~/product-microservice.tar
                docker load -i ~/media-microservice.tar
                docker load -i ~/frontend.tar

                docker-compose up -d
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
