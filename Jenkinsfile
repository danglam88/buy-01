def predefinedEmails = 'dang.lam@gritlab.ax huong.le@gritlab.ax iuliia.chipsanova@gritlab.ax nafisah.rantasalmi@gritlab.ax'

def runBackendSonarQubeAnalysis(directory, microserviceName) {
    sh """
        cd ${directory}
        mvn clean package sonar:sonar
    """
    echo "Static Analysis Completed for ${microserviceName}"
    stage("Quality Gate for ${microserviceName}") {
        timeout(time: 30, unit: 'MINUTES') {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') {
                error "Pipeline aborted due to quality gate failure for ${microserviceName}: ${qg.status}"
            }
        }
        echo "Quality Gate Passed for ${microserviceName}"
    }
}

def runFrontendSonarQubeAnalysis(directory) {
    sh """
        cd ${directory}
        npm install
        # Include SonarQube analysis command for Angular here
        echo 'Static Analysis Completed for Frontend'
    """
    stage("Quality Gate") {
        timeout(time: 30, unit: 'MINUTES') {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') {
                error "Pipeline aborted due to quality gate failure: ${qg.status} in Frontend"
            }
        }
        echo 'Quality Gate Passed for Frontend' 
    }
}

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
        stage('Setup Credentials') {
            steps {
                script {
                    withCredentials([
                        usernamePassword(credentialsId: 'user-mongodb-creds', usernameVariable: 'USER_DB_USERNAME', passwordVariable: 'USER_DB_PASSWORD'),
                        usernamePassword(credentialsId: 'product-mongodb-creds', usernameVariable: 'PRODUCT_DB_USERNAME', passwordVariable: 'PRODUCT_DB_PASSWORD'),
                        usernamePassword(credentialsId: 'media-mongodb-creds', usernameVariable: 'MEDIA_DB_USERNAME', passwordVariable: 'MEDIA_DB_PASSWORD'),
                        string(credentialsId: 'jwt-secret-creds', variable: 'JWT_SECRET')
                    ]) {
                        env.USER_DB_USERNAME = USER_DB_USERNAME
                        env.USER_DB_PASSWORD = USER_DB_PASSWORD
                        env.PRODUCT_DB_USERNAME = PRODUCT_DB_USERNAME
                        env.PRODUCT_DB_PASSWORD = PRODUCT_DB_PASSWORD
                        env.MEDIA_DB_USERNAME = MEDIA_DB_USERNAME
                        env.MEDIA_DB_PASSWORD = MEDIA_DB_PASSWORD
                        env.JWT_SECRET_VALUE = JWT_SECRET
                    }
                }
            }
        }

        stage('Code Quality Checks by SonarQube') {
            parallel {
                stage('Frontend Code Quality') {
                    agent { label 'build-agent' }
                    steps {
                        script {
                            runFrontendSonarQubeAnalysis('frontend')
                        }
                    }
                }
                stage('Media-Microservice Code Quality') {
                    agent { label 'build-agent' }
                    steps {
                        script {
                            runBackendSonarQubeAnalysis('backend/media', 'Media-Microservice')
                        }
                    }
                }
                stage('Product-Microservice Code Quality') {
                    agent { label 'build-agent' }
                    steps {
                        script {
                            runBackendSonarQubeAnalysis('backend/product', 'Product-Microservice')
                        }
                    }
                }
                stage('User-Microservice Code Quality') {
                    agent { label 'build-agent' }
                    steps {
                        script {
                            runBackendSonarQubeAnalysis('backend/user', 'User-Microservice')
                        }
                    }
                }
            }
        }

        stage('Unit Tests') {
            parallel {
                stage('Frontend Tests') {
                    agent { label 'build-agent' }
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
                    agent { label 'build-agent' }
                    steps {
                        sh '''
                        cd backend/media
                        mvn test
                        '''
                    }
                }
                stage('Product-Microservice Tests') {
                    agent { label 'build-agent' }
                    steps {
                        sh '''
                        cd backend/product
                        mvn test
                        '''
                    }
                }
                stage('User-Microservice Tests') {
                    agent { label 'build-agent' }
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
                    // Define the variables to be masked
                    def maskVars = [
                        [var: 'USER_DB_USERNAME', password: env.USER_DB_USERNAME],
                        [var: 'USER_DB_PASSWORD', password: env.USER_DB_PASSWORD],
                        [var: 'PRODUCT_DB_USERNAME', password: env.PRODUCT_DB_USERNAME],
                        [var: 'PRODUCT_DB_PASSWORD', password: env.PRODUCT_DB_PASSWORD],
                        [var: 'MEDIA_DB_USERNAME', password: env.MEDIA_DB_USERNAME],
                        [var: 'MEDIA_DB_PASSWORD', password: env.MEDIA_DB_PASSWORD],
                        [var: 'JWT_SECRET_VALUE', password: env.JWT_SECRET_VALUE]
                    ]

                    // Use maskPasswords with named arguments
                    maskPasswords(scope: 'GLOBAL', varPasswordPairs: maskVars) {
                        // Execute the build commands
                        sh '''
                        docker system prune -a -f

                        cd backend

                        docker build -t user-microservice -f user/Dockerfile \
                            --build-arg USER_DB_CREDENTIALS_USERNAME=$USER_DB_USERNAME \
                            --build-arg USER_DB_CREDENTIALS_PASSWORD=$USER_DB_PASSWORD \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
                        docker tag user-microservice $USER_MICROSERVICE_IMAGE
                        docker push $USER_MICROSERVICE_IMAGE

                        docker build -t product-microservice -f product/Dockerfile \
                            --build-arg PRODUCT_DB_CREDENTIALS_USERNAME=$PRODUCT_DB_USERNAME \
                            --build-arg PRODUCT_DB_CREDENTIALS_PASSWORD=$PRODUCT_DB_PASSWORD \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
                        docker tag product-microservice $PRODUCT_MICROSERVICE_IMAGE
                        docker push $PRODUCT_MICROSERVICE_IMAGE

                        docker build -t media-microservice -f media/Dockerfile \
                            --build-arg MEDIA_DB_CREDENTIALS_USERNAME=$MEDIA_DB_USERNAME \
                            --build-arg MEDIA_DB_CREDENTIALS_PASSWORD=$MEDIA_DB_PASSWORD \
                            --build-arg JWT_SECRET=$JWT_SECRET_VALUE \
                            .
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
        }
        
        stage('Deploy') {
            agent { label 'deploy-agent' } // This stage will be executed on the 'deploy' agent
            steps {
                script {
                    // Define the variables to be masked
                    def maskVars = [
                        [var: 'USER_DB_USERNAME', password: env.USER_DB_USERNAME],
                        [var: 'USER_DB_PASSWORD', password: env.USER_DB_PASSWORD],
                        [var: 'PRODUCT_DB_USERNAME', password: env.PRODUCT_DB_USERNAME],
                        [var: 'PRODUCT_DB_PASSWORD', password: env.PRODUCT_DB_PASSWORD],
                        [var: 'MEDIA_DB_USERNAME', password: env.MEDIA_DB_USERNAME],
                        [var: 'MEDIA_DB_PASSWORD', password: env.MEDIA_DB_PASSWORD]
                    ]

                    try {
                        // Use maskPasswords with named arguments
                        maskPasswords(scope: 'GLOBAL', varPasswordPairs: maskVars) {
                            // Execute the deploy commands
                            sh '''
                            export USER_DB_CREDENTIALS_USERNAME=$USER_DB_USERNAME
                            export USER_DB_CREDENTIALS_PASSWORD=$USER_DB_PASSWORD
                            export PRODUCT_DB_CREDENTIALS_USERNAME=$PRODUCT_DB_USERNAME
                            export PRODUCT_DB_CREDENTIALS_PASSWORD=$PRODUCT_DB_PASSWORD
                            export MEDIA_DB_CREDENTIALS_USERNAME=$MEDIA_DB_USERNAME
                            export MEDIA_DB_CREDENTIALS_PASSWORD=$MEDIA_DB_PASSWORD

                            if [ "$(docker ps -aq)" != "" ]; then
                                docker rm -f $(docker ps -aq)
                            fi
                            docker system prune -a -f

                            docker pull $USER_MICROSERVICE_IMAGE
                            docker pull $PRODUCT_MICROSERVICE_IMAGE
                            docker pull $MEDIA_MICROSERVICE_IMAGE
                            docker pull $FRONTEND_IMAGE

                            docker-compose up -d

                            if [ "$(docker ps -q | wc -l)" != "9" ]; then
                                exit 1
                            fi

                            docker save -o ~/user-microservice.tar $USER_MICROSERVICE_IMAGE
                            docker save -o ~/product-microservice.tar $PRODUCT_MICROSERVICE_IMAGE
                            docker save -o ~/media-microservice.tar $MEDIA_MICROSERVICE_IMAGE
                            docker save -o ~/frontend.tar $FRONTEND_IMAGE

                            if [ ! -d "~/backup" ]; then
                                mkdir -p ~/backup
                            fi

                            mv ~/*.tar ~/backup/
                            '''
                        }
                    } catch (err) {
                        // Use maskPasswords with named arguments
                        maskPasswords(scope: 'GLOBAL', varPasswordPairs: maskVars) {
                            // If deploy fails, the rollback commands are executed
                            sh '''
                            echo "Deployment failed. Executing rollback."
                            
                            export USER_DB_CREDENTIALS_USERNAME=$USER_DB_USERNAME
                            export USER_DB_CREDENTIALS_PASSWORD=$USER_DB_PASSWORD
                            export PRODUCT_DB_CREDENTIALS_USERNAME=$PRODUCT_DB_USERNAME
                            export PRODUCT_DB_CREDENTIALS_PASSWORD=$PRODUCT_DB_PASSWORD
                            export MEDIA_DB_CREDENTIALS_USERNAME=$MEDIA_DB_USERNAME
                            export MEDIA_DB_CREDENTIALS_PASSWORD=$MEDIA_DB_PASSWORD

                            if [ "$(docker ps -aq)" != "" ]; then
                                docker rm -f $(docker ps -aq)
                            fi
                            docker system prune -a -f

                            cp ~/backup/*.tar ~/

                            docker load -i ~/user-microservice.tar
                            docker load -i ~/product-microservice.tar
                            docker load -i ~/media-microservice.tar
                            docker load -i ~/frontend.tar

                            docker-compose up -d
                            '''
                        }

                        // Re-throw the error so that the pipeline fails
                        throw err
                    }
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
