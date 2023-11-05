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
                    agent { label 'build-agent' } // This stage will be executed on the 'build' agent for the frontend tests
                    steps {
                        cleanWs() // Clean the workspace on the 'build' agent for the frontend tests

                        sh '''
                        cd frontend
                        npm install
                        ng test --watch=false --browsers ChromeHeadless
                        '''
                    }
                }
                stage('Media-Microservice Tests') {
                    agent { label 'build-agent' } // This stage will be executed on the 'build' agent for the media-microservice tests
                    steps {
                        cleanWs() // Clean the workspace on the 'build' agent for the media-microservice tests

                        sh '''
                        cd backend/media
                        mvn test
                        '''
                    }
                }
                stage('Product-Microservice Tests') {
                    agent { label 'build-agent' } // This stage will be executed on the 'build' agent for the product-microservice tests
                    steps {
                        cleanWs() // Clean the workspace on the 'build' agent for the product-microservice tests

                        sh '''
                        cd backend/product
                        mvn test
                        '''
                    }
                }
                stage('User-Microservice Tests') {
                    agent { label 'build-agent' } // This stage will be executed on the 'build' agent for the user-microservice tests
                    steps {
                        cleanWs() // Clean the workspace on the 'build' agent for the user-microservice tests

                        sh '''
                        cd backend/user
                        mvn test
                        '''
                    }
                }
            }
        }

        stage('Build') {
            agent { label 'build-agent' } // This stage will be executed on the 'build' agent for the build itself
            steps {
                cleanWs() // Clean the workspace on the 'build' agent for the build itself

                script {
                    // Execute the build commands
                    sh '''
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
                    '''
                }
            }
        }
        
        stage('Deploy') {
            agent { label 'deploy-agent' } // This stage will be executed on the 'deploy' agent
            steps {
                cleanWs() // Clean the workspace on the 'deploy' agent

                script {
                    // Execute the deploy commands
                    sh '''
                    docker-compose down --remove-orphans
                    docker system prune -a -f

                    rm -rf ~/*.tar

                    docker pull danglamgritlab/user-microservice:latest
                    docker pull danglamgritlab/product-microservice:latest
                    docker pull danglamgritlab/media-microservice:latest
                    docker pull danglamgritlab/frontend:latest

                    docker-compose up -d
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
                docker save -o ~/user-microservice.tar danglamgritlab/user-microservice
                docker save -o ~/product-microservice.tar danglamgritlab/product-microservice
                docker save -o ~/media-microservice.tar danglamgritlab/media-microservice
                docker save -o ~/frontend.tar danglamgritlab/frontend

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
                docker-compose down --remove-orphans
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

        changed {
            script {
                if (currentBuild.resultIsBetterOrEqualTo('SUCCESS') && currentBuild.previousBuild.resultIsWorseOrEqualTo('FAILURE')) {
                    // If deploy recovers from failure, the backup commands are executed
                    echo "Deployment recovered. Executing backup."
                    sh '''
                    docker save -o ~/user-microservice.tar danglamgritlab/user-microservice
                    docker save -o ~/product-microservice.tar danglamgritlab/product-microservice
                    docker save -o ~/media-microservice.tar danglamgritlab/media-microservice
                    docker save -o ~/frontend.tar danglamgritlab/frontend

                    if [ ! -d "~/backup" ]; then
                        mkdir -p ~/backup
                    fi

                    mv ~/*.tar ~/backup/
                    '''

                    mail to: "${predefinedEmails}",
                        subject: "Jenkins Pipeline RECOVERED: ${currentBuild.fullDisplayName}",
                        body: """Hello,

The Jenkins Pipeline ${currentBuild.fullDisplayName} has recovered from failure.

See full details at: ${env.BUILD_URL}

Best regards,
Gritlab Jenkins
"""
                }
            }
        }
    }
}
