class CommitsController < ApplicationController
  def show
    repo = Repo.new(params[:course_id])
    commit = repo.commit(params[:id])

    render json: { commit: commit.payload }
  end
end
