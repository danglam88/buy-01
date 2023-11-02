def predefinedEmails = 'dang.lam@gritlab.ax'

pipeline {
    agent none // We define the specific agents within each stage

    options {
        timestamps()  // Add timestamps to console output
        timeout(time: 30, unit: 'MINUTES')  // Set a timeout of 30 minutes for the entire pipeline
    }

    stages {
        stage('Build') {
            agent { label 'master' } // This stage will be executed on the 'master' agent
            steps {
                script {
                    // Execute the build commands
                    sh '''
                    docker rm -f \$(docker ps -aq) || true
                    docker rmi -f \$(docker images -aq) || true
                    docker volume rm \$(docker volume ls -q) || true
                    docker network rm \$(docker network ls -q) || true

                    export DOCKER_DEFAULT_PLATFORM=linux/amd64
                    docker-compose build

                    docker tag buy-01-pipeline-user-microservice danglamgritlab/user-microservice:latest
                    docker push danglamgritlab/user-microservice:latest

                    docker tag buy-01-pipeline-product-microservice danglamgritlab/product-microservice:latest
                    docker push danglamgritlab/product-microservice:latest

                    docker tag buy-01-pipeline-media-microservice danglamgritlab/media-microservice:latest
                    docker push danglamgritlab/media-microservice:latest

                    docker tag buy-01-pipeline-frontend danglamgritlab/frontend:latest
                    docker push danglamgritlab/frontend:latest
                    '''
                }
            }
        }
        
        stage('Deploy') {
            agent { label 'deploy' } // This stage will be executed on the 'deploy' agent
            steps {
                script {
                    // Using try-catch for the deploy and potential rollback
                    try {
                        // Execute the deploy commands
                        sh '''
                        docker rm -f \$(docker ps -aq) || true
                        docker rmi -f \$(docker images -aq) || true
                        docker volume rm \$(docker volume ls -q) || true
                        docker network rm \$(docker network ls -q) || true

                        cd /mnt/myvolume

                        docker pull danglamgritlab/user-microservice:latest
                        docker pull danglamgritlab/product-microservice:latest
                        docker pull danglamgritlab/media-microservice:latest
                        docker pull danglamgritlab/frontend:latest

                        docker-compose up -d
                        '''
                    } catch (Exception e) {
                        // If deploy fails, the rollback commands are executed
                        echo "Deployment failed. Executing rollback."
                        sh '''
                        docker rm -f \$(docker ps -aq) || true
                        docker rmi -f \$(docker images -aq) || true
                        docker volume rm \$(docker volume ls -q) || true
                        docker network rm \$(docker network ls -q) || true

                        cd /mnt/myvolume
                        rm -rf *.tar
                        cp backup/*.tar .

                        docker load -i user-microservice.tar
                        docker load -i product-microservice.tar
                        docker load -i media-microservice.tar
                        docker load -i frontend.tar

                        docker-compose up -d
                        '''
                        // Rethrow the exception to mark the pipeline as failed
                        throw e
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
                sh '''
                cd /mnt/myvolume

                docker save -o user-microservice.tar danglamgritlab/user-microservice
                docker save -o product-microservice.tar danglamgritlab/product-microservice
                docker save -o media-microservice.tar danglamgritlab/media-microservice
                docker save -o frontend.tar danglamgritlab/frontend

                if [ ! -d "/mnt/myvolume/backup" ]; then
                    mkdir -p /mnt/myvolume/backup
                fi

                mv *.tar backup/
                '''
            }
        }

        failure {
            script {
                def culprits = currentBuild.rawBuild.getCulprits().collect { it.getFullName() }.join(', ')
                if (culprits) {
                    mail to: "${culprits}, ${predefinedEmails}",
                        subject: "Jenkins Build FAILURE: ${currentBuild.fullDisplayName}",
                        body: '''Hello,

The Jenkins build ${currentBuild.fullDisplayName} has failed.

Best regards,
Gritlab Jenkins
'''
                } else {
                    mail to: "${predefinedEmails}",
                        subject: "Jenkins Build FAILURE: ${currentBuild.fullDisplayName}",
                        body: '''Hello,

The Jenkins build ${currentBuild.fullDisplayName} has failed.

Best regards,
Gritlab Jenkins
'''
                }
            }
        }

        changed {
            script {
                if (currentBuild.resultIsBetterOrEqualTo('SUCCESS') && currentBuild.previousBuild.resultIsWorseOrEqualTo('FAILURE')) {
                    mail to: "${predefinedEmails}",
                         subject: "Jenkins Build RECOVERED: ${currentBuild.fullDisplayName}",
                         body: '''Hello,

The Jenkins build ${currentBuild.fullDisplayName} has recovered from failure.

Best regards,
Gritlab Jenkins
'''
                }
            }
        }
    }
}
